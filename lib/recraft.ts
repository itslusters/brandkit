import 'server-only'

const RECRAFT_GENERATE_URL = 'https://external.api.recraft.ai/v1/images/generations'
const RECRAFT_VECTORIZE_URL = 'https://external.api.recraft.ai/v1/images/vectorize'

export type RecraftStyle = 'vector_illustration' | 'digital_illustration' | 'realistic_image' | 'icon'
export type RecraftModel = 'recraftv2' | 'recraftv3'

interface RecraftOptions {
  style?: RecraftStyle
  substyle?: string
  size?: string
  model?: RecraftModel
  /** Overrides `style` when set — use a custom-trained style UUID from Recraft Studio. */
  styleId?: string
}

interface RecraftResponse {
  data?: Array<{ b64_json?: string; url?: string }>
  error?: { message?: string }
}

export async function generateRecraftImage(
  prompt: string,
  options: RecraftOptions = {},
): Promise<Buffer> {
  const apiKey = process.env.RECRAFT_API_KEY
  if (!apiKey) throw new Error('RECRAFT_API_KEY not configured')

  // Prefer explicit styleId arg, then env-level trained style, then named style.
  const styleId = options.styleId ?? process.env.RECRAFT_STYLE_ID
  const styleField = styleId
    ? { style_id: styleId }
    : { style: options.style ?? 'vector_illustration', ...(options.substyle ? { substyle: options.substyle } : {}) }

  const res = await fetch(RECRAFT_GENERATE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: options.model ?? 'recraftv3',
      ...styleField,
      size: options.size ?? '1024x1024',
      n: 1,
      response_format: 'b64_json',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Recraft generate ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as RecraftResponse
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error(data.error?.message ?? 'Recraft returned no image')
  return Buffer.from(b64, 'base64')
}

/**
 * Convert a raster image to a true multi-color SVG via Recraft's vectorize endpoint.
 * Unlike potrace (monochrome silhouette), this preserves colors, layers, and curves —
 * producing print-ready, editable SVGs suitable for brand identity use.
 */
export async function vectorizeRecraftImage(pngBuffer: Buffer): Promise<string> {
  const apiKey = process.env.RECRAFT_API_KEY
  if (!apiKey) throw new Error('RECRAFT_API_KEY not configured')

  const form = new FormData()
  const blob = new Blob([new Uint8Array(pngBuffer)], { type: 'image/png' })
  form.append('file', blob, 'logo.png')
  form.append('response_format', 'url')

  const res = await fetch(RECRAFT_VECTORIZE_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: form,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Recraft vectorize ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as RecraftResponse
  const url = data.data?.[0]?.url
  if (!url) throw new Error(data.error?.message ?? 'Recraft vectorize returned no URL')

  const svgRes = await fetch(url)
  if (!svgRes.ok) throw new Error(`Failed to fetch SVG: ${svgRes.status}`)
  return await svgRes.text()
}
