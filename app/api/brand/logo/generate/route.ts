import { genai, buildLogoPrompt, ITERATION_MODIFIERS } from '@/lib/gemini'
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
      controller.enqueue(sse({
        type: 'image_error',
        index: i,
        message: err instanceof Error ? err.message : 'Wordmark render failed',
      }))
    }
  })

  await Promise.allSettled(tasks)
}

// Imagen-based generation for symbol-text and emblem types
async function generateWithImagen(
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
      const response = await genai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png' },
      })
      const rawBase64 = response.generatedImages?.[0]?.image?.imageBytes ?? ''
      // Post-process: flatten bg, auto-trim, re-center, sharpen
      const processed = await postprocessLogo(Buffer.from(rawBase64, 'base64'))
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
  const ip = getIp(req)
  const { success } = await logoLimiter.limit(ip)
  if (!success) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Daily limit reached. Please try again tomorrow.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { brandInput, brandResult, selectedName, logoType, iterationModifier }: RequestBody = await req.json()
  const validModifier = iterationModifier && iterationModifier in ITERATION_MODIFIERS ? iterationModifier : undefined

  const body = new ReadableStream({
    async start(controller) {
      if (logoType === 'wordmark' && !validModifier) {
        // Typography-first: satori renders wordmarks with curated Google Fonts.
        // No Imagen call = instant, consistent, free, always typographically refined.
        // If user is iterating (validModifier set), fall back to Imagen for variety.
        await generateWordmarks(controller, brandInput, brandResult, selectedName)
      } else {
        // Symbol+text, emblem, or wordmark-with-modifier → Imagen
        await generateWithImagen(controller, brandInput, brandResult, selectedName, logoType, validModifier)
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
