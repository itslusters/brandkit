import { resolveRequestIdentity } from '@/lib/request-identity'
import { buildLogoPrompt, ITERATION_MODIFIERS } from '@/lib/gemini'
import { generateRecraftImage } from '@/lib/recraft'
import { pickLogoStyle } from '@/lib/industry-anchor'
import { getLogoLimiter } from '@/lib/ratelimit'
import { getUserTier } from '@/lib/tier'
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

// Recraft V3 named styles drive every logo. Style is picked per-brand from
// the brief's recommendedStyle + logoType via pickLogoStyle:
//   - default → vector_illustration (works for the vast majority of brands)
//   - brief reads as illustrated / hand-drawn → digital_illustration
//   - explicit symbol mark request → icon
// We intentionally DO NOT apply a trained style_id: five reference images
// per trained style can't cover the aesthetic range of an arbitrary brand,
// and empirically the trained style was flattening the structural
// differences between wordmark / symbol-text / emblem.
async function generateWithRecraft(
  controller: ReadableStreamDefaultController,
  brandInput: BrandInput,
  brandResult: BrandResult,
  selectedName: string,
  logoType: LogoType,
  modifier?: IterationModifier,
) {
  const namedStyle = pickLogoStyle(brandResult.styleBrief.recommendedStyle, logoType)
  const tasks = [0, 1, 2].map(async (i) => {
    try {
      const prompt = buildLogoPrompt(brandInput, brandResult, selectedName, logoType, i, modifier)
      const raw = await generateRecraftImage(prompt, {
        style: namedStyle,
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
  const { userId, rlKey } = await resolveRequestIdentity(req)

  // Tier-aware, per-user 24h rate limit. Skipped in local dev so unit
  // testing doesn't burn through the quota. Paid tiers get markedly
  // higher limits; see LOGO_PER_TIER in lib/ratelimit.ts.
  if (process.env.NODE_ENV !== 'development') {
    const tier = userId ? await getUserTier() : 'free'
    const { success } = await getLogoLimiter(tier).limit(rlKey)
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
