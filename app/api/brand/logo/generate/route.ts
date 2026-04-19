import { buildLogoPrompt, ITERATION_MODIFIERS } from '@/lib/gemini'
import { generateRecraftImage } from '@/lib/recraft'
import { logoLimiter, getIp } from '@/lib/ratelimit'
import { pickFontsForTones } from '@/lib/fonts'
import { renderWordmark, WORDMARK_LAYOUTS } from '@/lib/wordmark'
import { postprocessLogo } from '@/lib/logo-postprocess'
import type { BrandInput, BrandResult, LogoType, IterationModifier } from '@/lib/types'

interface RequestBody {
  brandInput: BrandInput
  brandResult: BrandResult
  selectedName: string
  logoType: LogoType
  iterationModifier?: IterationModifier
}

function sse(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

// Typography-first wordmark generation — no Imagen call, pure satori + sharp.
// Picks 3 fonts from different categories based on brand tones, renders 3 layouts.
async function generateWordmarks(
  controller: ReadableStreamDefaultController,
  brandInput: BrandInput,
  brandResult: BrandResult,
  selectedName: string,
) {
  const fonts = pickFontsForTones(brandInput.tones, brandInput.customTone, brandInput.stylePack)
  const primaryColor = brandResult.styleBrief.colorPalette[0] ?? '#18181b'
  const secondaryColor = brandResult.styleBrief.colorPalette[1] ?? '#ffffff'

  const tasks = fonts.map(async (font, i) => {
    try {
      const layout = WORDMARK_LAYOUTS[i % WORDMARK_LAYOUTS.length]
      const png = await renderWordmark({ brandName: selectedName, font, primaryColor, secondaryColor, layout })
      const dataUrl = `data:image/png;base64,${png.toString('base64')}`
      controller.enqueue(sse({ type: 'image_ready', index: i, dataUrl }))
    } catch (err) {
      // Include font name in error — key signal when satori fails on specific fonts (often variable-font parsing issues).
      const baseMsg = err instanceof Error ? err.message : 'Wordmark render failed'
      console.error(`[wordmark] render failed for font=${font.family} (${font.file}):`, err)
      controller.enqueue(sse({
        type: 'image_error',
        index: i,
        message: `${font.family}: ${baseMsg}`,
      }))
    }
  })

  await Promise.allSettled(tasks)
}

// Recraft V3-based generation for symbol-text and emblem types.
// vector_illustration style produces crisp, brand-grade vector logos — markedly
// better than Imagen for logo/identity work (superior text rendering, less
// "AI-generated" feel, designed for vector/brand output).
async function generateWithRecraft(
  controller: ReadableStreamDefaultController,
  brandInput: BrandInput,
  brandResult: BrandResult,
  selectedName: string,
  logoType: LogoType,
  modifier?: IterationModifier,
) {
  const tasks = [0, 1, 2].map(async (i) => {
    try {
      const prompt = buildLogoPrompt(brandInput, brandResult, selectedName, logoType, i, modifier)
      const raw = await generateRecraftImage(prompt, { style: 'vector_illustration', variationIndex: i })
      const processed = await postprocessLogo(raw)
      controller.enqueue(sse({ type: 'image_ready', index: i, dataUrl: `data:image/png;base64,${processed.toString('base64')}` }))
    } catch (err) {
      controller.enqueue(sse({
        type: 'image_error',
        index: i,
        message: err instanceof Error ? err.message : 'Image generation failed',
      }))
    }
  })

  await Promise.allSettled(tasks)
}

export async function POST(req: Request) {
  // Skip rate limiting in development for unconstrained local testing.
  // Production/preview continue to enforce the per-IP daily cap.
  if (process.env.NODE_ENV !== 'development') {
    const ip = getIp(req)
    const { success } = await logoLimiter.limit(ip)
    if (!success) {
      return new Response(
        JSON.stringify({ type: 'error', message: 'Daily limit reached. Please try again tomorrow.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  const { brandInput, brandResult, selectedName, logoType, iterationModifier }: RequestBody = await req.json()
  const validModifier = iterationModifier && iterationModifier in ITERATION_MODIFIERS ? iterationModifier : undefined

  const body = new ReadableStream({
    async start(controller) {
      if (logoType === 'wordmark' && !validModifier) {
        // Typography-first: satori renders wordmarks with curated Google Fonts.
        // No AI call = instant, consistent, free, always typographically refined.
        // If user is iterating (validModifier set), fall back to Recraft for variety.
        await generateWordmarks(controller, brandInput, brandResult, selectedName)
      } else {
        // Symbol+text, emblem, or wordmark-with-modifier → Recraft V3
        await generateWithRecraft(controller, brandInput, brandResult, selectedName, logoType, validModifier)
      }

      controller.enqueue(sse({ type: 'done' }))
      controller.close()
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
