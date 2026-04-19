import { buildLogoPrompt, ITERATION_MODIFIERS } from '@/lib/gemini'
import { generateRecraftImage, resolveStyleId } from '@/lib/recraft'
import { logoLimiter, getIp } from '@/lib/ratelimit'
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

// Recraft V3 drives every logo type. We used to render wordmarks via satori
// for typography-purity, but the user prefers Recraft's overall quality —
// especially with a custom-trained style_id applied — across all types. The
// structural contracts in LOGO_TYPE_DESCRIPTIONS (see lib/gemini.ts) are what
// keep wordmark / symbol-text / emblem visually distinguishable even when a
// trained style is pulling hard on the aesthetic.
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
      // Opt into the trained style for logos. The helper returns undefined if
      // no env is set → caller falls back to `vector_illustration` inside
      // generateRecraftImage. Rotating by variationIndex spreads the trained
      // styles across the 3 variations when multiple are configured.
      const styleId = resolveStyleId(i)
      const raw = await generateRecraftImage(prompt, {
        style: 'vector_illustration',
        styleId,
        variationIndex: i,
      })
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
      await generateWithRecraft(controller, brandInput, brandResult, selectedName, logoType, validModifier)
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
