import 'server-only'
import { GoogleGenAI } from '@google/genai'

/**
 * Google Imagen 4 image generation via the Gemini API. Replaces Recraft as the
 * brand image engine (logo / mood / mockup): Imagen follows natural-language
 * intent — "clean minimal SaaS wordmark, no figures" vs "warm organic food
 * mark" — so logos actually differ by category, where Recraft's fixed
 * `style: vector_illustration` flattened everything into the same illustrative
 * look and ignored the wordmark instruction. Output is raster PNG; callers that
 * need SVG run it through the existing vectorize step.
 */

export type ImagenAspect = '1:1' | '3:4' | '4:3' | '9:16' | '16:9'

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')
  if (!client) client = new GoogleGenAI({ apiKey })
  return client
}

/**
 * Imagen 4 model fallback chain. The standard and ultra tiers regularly return
 * 503 UNAVAILABLE / 429 "service is temporarily out of capacity" during peak
 * load — that's Google-side capacity, not our quota — which would otherwise
 * fail a brand's entire logo/mood step. The "fast" tier has its own capacity
 * pool and stays available when the heavier tiers are saturated, so we try it
 * first and degrade through the others. Fast quality is more than enough for
 * wordmark logos and mood frames; revisit ordering if quality regresses.
 */
const MODEL_CHAIN = [
  'imagen-4.0-fast-generate-001',
  'imagen-4.0-generate-001',
  'imagen-4.0-ultra-generate-001',
]

/**
 * Transient = worth retrying on the same model or falling back to the next one.
 * Covers the per-minute rate limit (429 / RESOURCE_EXHAUSTED) AND Google's
 * capacity failures (503 UNAVAILABLE, "out of capacity", "fail to execute
 * model"). Anything else (bad prompt, auth, safety block) is permanent.
 */
const isTransient = (err: unknown): boolean => {
  const s = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return (
    s.includes('429') ||
    s.includes('503') ||
    s.includes('resource_exhausted') ||
    s.includes('unavailable') ||
    s.includes('out of capacity') ||
    s.includes('quota') ||
    s.includes('rate limit') ||
    s.includes('fail to execute model') ||
    s.includes('try again')
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function generateOnModel(
  model: string,
  prompt: string,
  aspectRatio: ImagenAspect,
): Promise<Buffer> {
  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await getClient().models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio,
        },
      })
      const b64 = res.generatedImages?.[0]?.image?.imageBytes
      if (!b64) throw new Error('Imagen returned no image')
      return Buffer.from(b64, 'base64')
    } catch (err) {
      if (attempt < maxAttempts && isTransient(err)) {
        await sleep(800 * 2 ** (attempt - 1)) // 0.8s, 1.6s
        continue
      }
      throw err
    }
  }
  throw new Error('Imagen: exhausted retries')
}

/**
 * Generate one Imagen image, retrying transient rate-limit/capacity errors and
 * degrading across the Imagen 4 tiers (fast -> standard -> ultra) when a tier
 * is saturated. A non-transient error (bad prompt, auth, safety block) throws
 * immediately without burning the rest of the chain. An explicit `options.model`
 * is tried first, then the remaining tiers act as fallback.
 */
export async function generateImagenImage(
  prompt: string,
  options: { aspectRatio?: ImagenAspect; model?: string } = {},
): Promise<Buffer> {
  const aspectRatio = options.aspectRatio ?? '1:1'
  const chain = options.model
    ? [options.model, ...MODEL_CHAIN.filter((m) => m !== options.model)]
    : MODEL_CHAIN
  let lastErr: unknown
  for (const model of chain) {
    try {
      return await generateOnModel(model, prompt, aspectRatio)
    } catch (err) {
      lastErr = err
      if (isTransient(err)) continue // saturated tier — fall through to the next
      throw err // genuine failure — surface it, don't mask behind the chain
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Imagen: all models failed')
}
