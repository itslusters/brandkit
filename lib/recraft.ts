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

/**
 * Generate a brand mood image. Uses `RECRAFT_MOOD_STYLE_ID` (singular, one UUID)
 * or `RECRAFT_MOOD_STYLE_IDS` (plural, comma/whitespace-separated, rotated by
 * variationIndex) when set. Falls back to the `realistic_image` preset for
 * photorealistic output when no valid trained style is configured.
 */
export async function generateMoodImage(
  prompt: string,
  options: { size?: string; styleId?: string; variationIndex?: number } = {},
): Promise<Buffer> {
  const styleId = resolveMoodStyleId(options.variationIndex ?? 0, options.styleId)
  return generateRecraftImage(prompt, {
    styleId,
    style: styleId ? undefined : 'realistic_image',
    size: options.size ?? '1024x1024',
  })
}

export function resolveMoodStyleId(variationIndex = 0, override?: string): string | undefined {
  if (override && UUID_RE.test(override)) return override
  const raw = process.env.RECRAFT_MOOD_STYLE_IDS?.trim() || process.env.RECRAFT_MOOD_STYLE_ID?.trim()
  if (!raw) return undefined
  const candidates = raw.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean)
  const list = candidates.filter((id) => {
    if (UUID_RE.test(id)) return true
    console.warn(`[recraft] dropping invalid mood style UUID: "${id.slice(0, 40)}..."`)
    return false
  })
  if (list.length === 0) return undefined
  return list[variationIndex % list.length]
}

/**
 * Resolves which trained style to use for a given variation.
 *
 * Rotation priority:
 *   1. explicit `styleId` argument (wins)
 *   2. `RECRAFT_STYLE_IDS` env (comma-separated) — rotates by variationIndex
 *   3. `RECRAFT_STYLE_ID` env (single) — used for all variations
 *   4. undefined — fall back to named style like `vector_illustration`
 *
 * Recraft caps training uploads at 5 images per style, so users with larger
 * reference sets split them across multiple styles; rotating through them
 * uses every trained style AND makes the 3 variations more distinct.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function resolveStyleId(variationIndex = 0, override?: string): string | undefined {
  if (override) return override
  // Permissive split — handles comma, newline, whitespace, or mixed delimiters.
  // Each candidate must be a well-formed UUID; malformed entries are dropped with a warn.
  const raw = process.env.RECRAFT_STYLE_IDS?.trim()
  if (raw) {
    const candidates = raw.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean)
    const list = candidates.filter((id) => {
      if (UUID_RE.test(id)) return true
      console.warn(`[recraft] dropping invalid RECRAFT_STYLE_IDS entry (not a UUID): "${id.slice(0, 40)}..."`)
      return false
    })
    if (list.length > 0) return list[variationIndex % list.length]
  }
  const single = process.env.RECRAFT_STYLE_ID?.trim()
  if (single && UUID_RE.test(single)) return single
  if (single) console.warn(`[recraft] RECRAFT_STYLE_ID is not a valid UUID, falling back to named style`)
  return undefined
}

export async function generateRecraftImage(
  prompt: string,
  options: RecraftOptions & { variationIndex?: number } = {},
): Promise<Buffer> {
  const apiKey = process.env.RECRAFT_API_KEY
  if (!apiKey) throw new Error('RECRAFT_API_KEY not configured')

  const styleId = resolveStyleId(options.variationIndex ?? 0, options.styleId)
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
