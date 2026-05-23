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
 * Generate a brand mood image. Callers should pass a `style` derived from the
 * brand brief (see pickMoodStyle in lib/mood-templates.ts) so a vector brand
 * gets vector mood images, an illustrated brand gets illustrated ones, etc.
 *
 * `RECRAFT_MOOD_STYLE_ID(S)` env still works as a per-deployment override —
 * when set it forces a trained style and ignores `options.style`. Default
 * setup leaves it empty so brief-driven style picking wins.
 */
export async function generateMoodImage(
  prompt: string,
  options: { size?: string; styleId?: string; variationIndex?: number; style?: RecraftStyle } = {},
): Promise<Buffer> {
  const styleId = resolveMoodStyleId(options.variationIndex ?? 0, options.styleId)
  return generateRecraftImage(prompt, {
    styleId,
    style: styleId ? undefined : (options.style ?? 'realistic_image'),
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
 * Resolves which trained style to use for a given variation, logo type,
 * and (optionally) style pack. Returns both the UUID and the env key that
 * matched so callers can log the decision.
 *
 * Recraft caps training at 5 images per style, so one universal style
 * can't cover every aesthetic a brand might want. The lookup cascades from
 * most to least specific so users can layer styles as their library grows:
 *
 *   1. explicit `override` argument                           (caller-controlled)
 *   2. RECRAFT_STYLE_ID[S]_{TYPE}_{STYLEPACK}                 (type × pack)
 *   3. RECRAFT_STYLE_ID[S]_{TYPE}                             (type only)
 *   4. RECRAFT_STYLE_ID[S]_{STYLEPACK}                        (pack only)
 *   5. RECRAFT_STYLE_ID[S]                                    (generic)
 *   6. undefined → caller falls back to `vector_illustration` (prompt-driven)
 *
 * The `_IDS` (plural) variants are comma/whitespace-separated UUIDs,
 * rotated by variationIndex. Stylepacks: editorial, geometric, organic,
 * bold, tech. Types: WORDMARK, SYMBOL_TEXT, EMBLEM.
 *
 * Example env keys — most specific to least:
 *   RECRAFT_STYLE_IDS_WORDMARK_EDITORIAL  — serif-forward wordmarks
 *   RECRAFT_STYLE_IDS_WORDMARK_TECH       — monospace/tech wordmarks
 *   RECRAFT_STYLE_IDS_WORDMARK            — fallback for other packs
 *   RECRAFT_STYLE_ID                      — fallback for any type/pack
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type LogoStyleType = 'wordmark' | 'symbol-text' | 'emblem'

const TYPE_TO_ENV_SUFFIX: Record<LogoStyleType, string> = {
  'wordmark': 'WORDMARK',
  'symbol-text': 'SYMBOL_TEXT',
  'emblem': 'EMBLEM',
}

const VALID_STYLEPACK_SUFFIXES = new Set(['EDITORIAL', 'GEOMETRIC', 'ORGANIC', 'BOLD', 'TECH'])

export interface ResolvedStyle {
  styleId: string
  source: string
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

/**
 * Try a list-then-single pair for the given env root. Returns both the UUID
 * and which exact env key matched, so the caller can log the resolution.
 */
function tryEnv(envRoot: string, variationIndex: number): ResolvedStyle | undefined {
  const listName = `RECRAFT_STYLE_IDS_${envRoot}`
  const singleName = `RECRAFT_STYLE_ID_${envRoot}`
  const fromList = pickFromList(process.env[listName]?.trim(), listName, variationIndex)
  if (fromList) return { styleId: fromList, source: listName }
  const fromSingle = pickSingle(process.env[singleName]?.trim(), singleName)
  if (fromSingle) return { styleId: fromSingle, source: singleName }
  return undefined
}

function tryGenericEnv(variationIndex: number): ResolvedStyle | undefined {
  const fromList = pickFromList(process.env.RECRAFT_STYLE_IDS?.trim(), 'RECRAFT_STYLE_IDS', variationIndex)
  if (fromList) return { styleId: fromList, source: 'RECRAFT_STYLE_IDS' }
  const fromSingle = pickSingle(process.env.RECRAFT_STYLE_ID?.trim(), 'RECRAFT_STYLE_ID')
  if (fromSingle) return { styleId: fromSingle, source: 'RECRAFT_STYLE_ID' }
  return undefined
}

export function resolveStyleIdDetailed(
  variationIndex = 0,
  override?: string,
  logoType?: LogoStyleType,
  stylePack?: string,
): ResolvedStyle | undefined {
  if (override) return { styleId: override, source: 'override' }

  const typeSuffix = logoType ? TYPE_TO_ENV_SUFFIX[logoType] : undefined
  const packSuffix = stylePack ? stylePack.toUpperCase() : undefined
  const packValid = !!packSuffix && VALID_STYLEPACK_SUFFIXES.has(packSuffix)

  // 1. Type × pack — most specific.
  if (typeSuffix && packValid) {
    const hit = tryEnv(`${typeSuffix}_${packSuffix}`, variationIndex)
    if (hit) return hit
  }

  // 2. Type only.
  if (typeSuffix) {
    const hit = tryEnv(typeSuffix, variationIndex)
    if (hit) return hit
  }

  // 3. Pack only.
  if (packValid && packSuffix) {
    const hit = tryEnv(packSuffix, variationIndex)
    if (hit) return hit
  }

  // 4. Generic fallback.
  return tryGenericEnv(variationIndex)
}

/** Backward-compatible wrapper — returns just the UUID string. */
export function resolveStyleId(
  variationIndex = 0,
  override?: string,
  logoType?: LogoStyleType,
  stylePack?: string,
): string | undefined {
  return resolveStyleIdDetailed(variationIndex, override, logoType, stylePack)?.styleId
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
