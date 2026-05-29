import 'server-only'

const RECRAFT_VECTORIZE_URL = 'https://external.api.recraft.ai/v1/images/vectorize'

interface RecraftResponse {
  data?: Array<{ b64_json?: string; url?: string }>
  error?: { message?: string }
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
