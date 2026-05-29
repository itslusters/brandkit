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

export async function generateImagenImage(
  prompt: string,
  options: { aspectRatio?: ImagenAspect; model?: string } = {},
): Promise<Buffer> {
  const res = await getClient().models.generateImages({
    model: options.model ?? 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: options.aspectRatio ?? '1:1',
    },
  })
  const b64 = res.generatedImages?.[0]?.image?.imageBytes
  if (!b64) throw new Error('Imagen returned no image')
  return Buffer.from(b64, 'base64')
}
