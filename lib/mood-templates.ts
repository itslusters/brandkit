import type { BrandInput, BrandResult } from './types'
import { getStylePack } from './style-packs'
import { hexToColorName } from './colors'

/**
 * Brand mood images — editorial/lifestyle visuals that communicate brand feel.
 * These are pure AI-generated scenes guided by brand tones/colors and (optionally)
 * the `RECRAFT_MOOD_STYLE_ID` trained style for consistent aesthetic tone.
 *
 * Free tier sees the first `MOOD_FREE_COUNT`; the rest are paywalled.
 */

export type MoodCategory =
  | 'hero'
  | 'product'
  | 'lifestyle'
  | 'texture'
  | 'still-life'
  | 'environment'
  | 'abstract'
  | 'palette'
  | 'editorial'

export interface MoodTemplate {
  id: MoodCategory
  label: string
  description: string
  size: '1024x1024' | '1365x1024' | '1024x1365'
  concept: string
}

export const MOOD_TEMPLATES: MoodTemplate[] = [
  { id: 'hero',        label: 'Hero',        description: 'Big editorial statement image',  size: '1365x1024', concept: 'Editorial hero image, magazine cover quality, dramatic composition, single strong subject, generous negative space' },
  { id: 'product',     label: 'Product',     description: 'Clean product photography',      size: '1024x1024', concept: 'Studio product photography, crisp lighting, soft shadow, single hero object centered, premium catalog feel' },
  { id: 'lifestyle',   label: 'Lifestyle',   description: 'Human moment, in-context',       size: '1365x1024', concept: 'Candid lifestyle scene, natural light, real people moment, documentary feel, authentic atmosphere' },
  { id: 'texture',     label: 'Texture',     description: 'Atmospheric surface detail',     size: '1024x1024', concept: 'Close-up material texture, tactile surface, moody atmosphere, cinematic grain, macro detail' },
  { id: 'still-life',  label: 'Still Life',  description: 'Curated flat-lay arrangement',   size: '1024x1024', concept: 'Top-down flat lay, curated object arrangement, intentional composition, editorial still life, balanced negative space' },
  { id: 'environment', label: 'Environment', description: 'Location & atmosphere',          size: '1365x1024', concept: 'Environmental wide shot, location-driven, architectural or natural setting, establishing atmosphere, cinematic depth' },
  { id: 'abstract',    label: 'Abstract',    description: 'Brand essence, non-literal',     size: '1024x1024', concept: 'Abstract visual essence, minimal graphic composition, brand feeling without literal subject, gallery art direction' },
  { id: 'palette',     label: 'Palette',     description: 'Color story + materials',        size: '1024x1024', concept: 'Color palette study, material samples arranged, Pinterest mood board aesthetic, designer swatch composition' },
  { id: 'editorial',   label: 'Editorial',   description: 'Type-forward layout',            size: '1024x1365', concept: 'Editorial spread, typographic emphasis, magazine layout, strong grid, considered whitespace' },
]

export function getMoodById(id: string): MoodTemplate | undefined {
  return MOOD_TEMPLATES.find((t) => t.id === id)
}

/**
 * Map the LLM-generated styleBrief.recommendedStyle string to one of Recraft's
 * built-in style presets. A minimal-vector brand should get vector_illustration
 * mood images, an illustrated brand should get digital_illustration ones, and
 * everything else defaults to photographic realistic_image — which is what the
 * mood pipeline was hard-locked to before (a problem when the brief clearly
 * wanted vector or illustration aesthetics).
 */
export function pickMoodStyle(
  recommendedStyle: string,
): 'vector_illustration' | 'digital_illustration' | 'realistic_image' {
  const s = recommendedStyle.toLowerCase()
  if (/\b(vector|flat\s*2?d?|geometric|minimal|clean\s*line|iconographic|isometric|graphic\s*mark|svg)\b/.test(s)) {
    return 'vector_illustration'
  }
  if (/\b(illustrat|hand[-\s]?drawn|painted|watercolor|gouache|sketch|cartoon|whimsical|playful)\b/.test(s)) {
    return 'digital_illustration'
  }
  return 'realistic_image'
}

export const MOOD_FREE_COUNT = 3
export const MOOD_PROMPT_LIMIT = 1000

export function buildMoodPrompt(
  input: BrandInput,
  result: BrandResult,
  template: MoodTemplate,
): string {
  const { colorPalette, recommendedStyle } = result.styleBrief
  const colors = colorPalette.slice(0, 3).map(hexToColorName)
  const packDirective = input.stylePack ? getStylePack(input.stylePack)?.promptDirective ?? '' : ''
  const tones = [...(input.tones ?? []), ...(input.customTone?.split(/[\s,]+/).filter(Boolean) ?? [])].slice(0, 4)

  const parts = [
    template.concept + '.',
    `Brand mood: ${tones.join(', ')}.`,
    `Aesthetic: ${recommendedStyle}.`,
    packDirective ? `Style: ${packDirective}` : '',
    `Color palette: ${colors.join(', ')}.`,
    `Industry context: ${input.industry}.`,
    'No text, no logos, no watermarks. High-end editorial photography quality.',
  ].filter(Boolean)

  let prompt = parts.join(' ')
  if (prompt.length > MOOD_PROMPT_LIMIT - 20) {
    prompt = prompt.slice(0, MOOD_PROMPT_LIMIT - 23) + '...'
  }
  return prompt
}
