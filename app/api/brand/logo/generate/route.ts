import { auth } from '@clerk/nextjs/server'
import { buildLogoPrompt, ITERATION_MODIFIERS } from '@/lib/gemini'
import { generateRecraftImage, resolveStyleId } from '@/lib/recraft'
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
  const tasks = [0, 1, 2].map(async (i) => {
    try {
      const prompt = buildLogoPrompt(brandInput, brandResult, selectedName, logoType, i, modifier)
      // Resolve a per-logo-type trained style when the user configures one.
      // Falls through to the generic RECRAFT_STYLE_ID[S] env, then to the
      // named `vector_illustration` style. Passing logoType is the lever
      // that makes wordmark / symbol-text / emblem actually look distinct
      // under trained styles — prompt-level structural directives alone
      // can't override a dominant trained aesthetic.
      const styleId = resolveStyleId(i, undefined, logoType)
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
