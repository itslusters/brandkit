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
 * Resolves which trained style to use for a given variation and (optionally)
 * logo type.
 *
 * Recraft's trained styles are aesthetically dominant — prompt-level
 * directives ("pure typography", "enclosed badge") can't reliably override
 * the visual training set. The way to keep structural differentiation
 * between wordmark / symbol-text / emblem while still benefiting from a
 * custom trained style is to train a SEPARATE style per logo type and
 * route each one to its own env var.
 *
 * Lookup priority per call:
 *   1. explicit `override` argument (wins — used by e.g. mood boards)
 *   2. Per-type envs for the provided logoType (most specific)
 *        RECRAFT_STYLE_IDS_WORDMARK / RECRAFT_STYLE_ID_WORDMARK
 *        RECRAFT_STYLE_IDS_SYMBOL_TEXT / RECRAFT_STYLE_ID_SYMBOL_TEXT
 *        RECRAFT_STYLE_IDS_EMBLEM / RECRAFT_STYLE_ID_EMBLEM
 *   3. Generic fallbacks — used when no per-type style is configured
 *        RECRAFT_STYLE_IDS / RECRAFT_STYLE_ID
 *   4. undefined → named style like `vector_illustration`
 *
 * The `_IDS` (plural) variants are comma/whitespace-separated UUIDs, rotated
 * by variationIndex so the 3 variations within a single logo type come out
 * slightly different. Train up to 5 images per style in Recraft, create 3
 * styles per type, list all 3 UUIDs in the IDS env — variations then span
 * the full training range.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type LogoStyleType = 'wordmark' | 'symbol-text' | 'emblem'

const TYPE_TO_ENV_SUFFIX: Record<LogoStyleType, string> = {
  'wordmark': 'WORDMARK',
  'symbol-text': 'SYMBOL_TEXT',
  'emblem': 'EMBLEM',
}

function pickFromList(raw: string | undefined, envName: string, variationIndex: number): string | undefined {
  if (!raw) return undefined
  const candidates = raw.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean)
  const list = candidates.filter((id) => {
    if (UUID_RE.test(id)) return true
    console.warn(`[recraft] dropping invalid ${envName} entry (not a UUID): "${id.slice(0, 40)}..."`)
    return false
  })
  if (list.length === 0) return undefined
  return list[variationIndex % list.length]
}

function pickSingle(raw: string | undefined, envName: string): string | undefined {
  if (!raw) return undefined
  if (UUID_RE.test(raw)) return raw
  console.warn(`[recraft] ${envName} is not a valid UUID, ignoring`)
  return undefined
}

export function resolveStyleId(
  variationIndex = 0,
  override?: string,
  logoType?: LogoStyleType,
): string | undefined {
  if (override) return override

  // Per-type lookup — checks plural list first, then single.
  if (logoType) {
    const suffix = TYPE_TO_ENV_SUFFIX[logoType]
    const typed = pickFromList(process.env[`RECRAFT_STYLE_IDS_${suffix}`]?.trim(), `RECRAFT_STYLE_IDS_${suffix}`, variationIndex)
      ?? pickSingle(process.env[`RECRAFT_STYLE_ID_${suffix}`]?.trim(), `RECRAFT_STYLE_ID_${suffix}`)
    if (typed) return typed
  }

  // Generic fallback — shared across all logo types when per-type envs aren't set.
  return pickFromList(process.env.RECRAFT_STYLE_IDS?.trim(), 'RECRAFT_STYLE_IDS', variationIndex)
    ?? pickSingle(process.env.RECRAFT_STYLE_ID?.trim(), 'RECRAFT_STYLE_ID')
}

export async function generateRecraftImage(
  prompt: string,
  options: RecraftOptions & { variationIndex?: number } = {},
): Promise<Buffer> {
  const apiKey = process.env.RECRAFT_API_KEY
  if (!apiKey) throw new Error('RECRAFT_API_KEY not configured')

  // Only use a trained style_id when the caller explicitly passes one.
  // Previously this silently resolved `RECRAFT_STYLE_ID` from env, which made
  // every logo generation inherit the trained aesthetic — flattening the
  // structural differences between wordmark / symbol-text / emblem. Callers
  // that want env-rotated styles (e.g. mood images) should run `resolveStyleId()`
  // themselves and pass the result in `options.styleId`.
  const styleId = options.styleId
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
