import { auth } from '@clerk/nextjs/server'
import { buildLogoPrompt, ITERATION_MODIFIERS } from '@/lib/gemini'
import { generateRecraftImage, resolveStyleIdDetailed } from '@/lib/recraft'
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
  // Variation 0-1 use the trained style for aesthetic consistency with the
  // brand's reference look. Variation 2 deliberately skips the trained style
  // and runs on the named `vector_illustration` style — this guarantees at
  // least one result that respects the structural prompt (wordmark /
  // symbol-text / emblem), which trained styles tend to steamroll. Users
  // see two brand-flavored takes plus one "textbook correct" take per
  // generation, widening the taste-space from a 5-image training set.
  const STRUCTURAL_ESCAPE_INDEX = 2

  const tasks = [0, 1, 2].map(async (i) => {
    try {
      const prompt = buildLogoPrompt(brandInput, brandResult, selectedName, logoType, i, modifier)

      const useTrained = i !== STRUCTURAL_ESCAPE_INDEX
      const resolved = useTrained
        ? resolveStyleIdDetailed(i, undefined, logoType, brandInput.stylePack)
        : undefined

      console.log('[logo/generate]', {
        type: logoType,
        variation: i,
        stylePack: brandInput.stylePack ?? null,
        styleId: resolved?.styleId ?? null,
        source: resolved?.source ?? 'named:vector_illustration',
      })

      const raw = await generateRecraftImage(prompt, {
        style: 'vector_illustration',
        styleId: resolved?.styleId,
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
  const { userId } = await auth()
  if (!userId) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Sign in required.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Tier-aware, per-user 24h rate limit. Skipped in local dev so unit
  // testing doesn't burn through the quota. Paid tiers get markedly
  // higher limits; see LOGO_PER_TIER in lib/ratelimit.ts.
  if (process.env.NODE_ENV !== 'development') {
    const tier = await getUserTier()
    const { success } = await getLogoLimiter(tier).limit(userId)
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
