import type { BrandInput, BrandResult } from './types'
import { getStylePack } from './style-packs'
import { hexToColorName } from './colors'
import { industryAnchor } from './industry-anchor'

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

// Concept lines reframed so they describe craft + composition without baking
// magazine framing into every category. The old "Editorial hero image, magazine
// cover quality" + "real people moment" cues were pulling every brand into the
// same publishing aesthetic regardless of industry. Each concept now reads as
// art-director-directed studio craft, with the category-fitting subject left to
// industryAnchor + the brief at build time.
export const MOOD_TEMPLATES: MoodTemplate[] = [
  { id: 'hero',        label: 'Hero',        description: 'Big editorial statement image',  size: '1365x1024', concept: 'Award-winning hero image, dramatic single-subject composition, generous negative space, art-director-directed lighting' },
  { id: 'product',     label: 'Product',     description: 'Clean product photography',      size: '1024x1024', concept: 'Studio masterclass product photography, considered light and shadow, single hero object centered, premium finish' },
  { id: 'lifestyle',   label: 'Lifestyle',   description: 'Brand-in-use scene',             size: '1365x1024', concept: 'Brand-in-use scene appropriate to the industry, natural light, authentic atmosphere, considered styling' },
  { id: 'texture',     label: 'Texture',     description: 'Atmospheric surface detail',     size: '1024x1024', concept: 'Macro material texture, tactile surface, cinematic grain, gallery-quality detail' },
  { id: 'still-life',  label: 'Still Life',  description: 'Curated flat-lay arrangement',   size: '1024x1024', concept: 'Top-down curated flat lay, intentional balance, gallery-quality still life with deliberate negative space' },
  { id: 'environment', label: 'Environment', description: 'Location & atmosphere',          size: '1365x1024', concept: 'Establishing wide shot, location-driven for the industry, considered depth and framing' },
  { id: 'abstract',    label: 'Abstract',    description: 'Brand essence, non-literal',     size: '1024x1024', concept: 'Abstract visual essence of the brand, minimal graphic composition, gallery art direction' },
  { id: 'palette',     label: 'Palette',     description: 'Color story + materials',        size: '1024x1024', concept: 'Color and material study, designer swatch composition, considered surfaces' },
  { id: 'editorial',   label: 'Editorial',   description: 'Type-forward layout',            size: '1024x1365', concept: 'Type-forward layout, strong grid, considered whitespace and typographic emphasis' },
]

export function getMoodById(id: string): MoodTemplate | undefined {
  return MOOD_TEMPLATES.find((t) => t.id === id)
}

/**
 * Map a template's pixel size to the nearest Imagen aspect ratio. Imagen takes
 * an aspectRatio (not pixel dimensions); the values returned here are all valid
 * `ImagenAspect` members.
 */
export function moodAspect(size: MoodTemplate['size']): '1:1' | '4:3' | '3:4' {
  if (size === '1365x1024') return '4:3'
  if (size === '1024x1365') return '3:4'
  return '1:1'
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
  // Strip the "X IDENTITY:" label from the anchor — Imagen renders shouted
  // labels as literal caption text inside the image. The descriptive clause
  // still locks the category before the brief (without it a SaaS brand drifts
  // into lifestyle imagery full of cars and handbags). Craft footer names the
  // grade to push past the generic AI-photo look.
  const anchor = industryAnchor(input.industry)
  const anchorDesc = anchor ? anchor.replace(/^[^:]+:\s*/, '') : ''
  const parts = [
    template.concept + '.',
    anchorDesc ? `Category character: ${anchorDesc}` : '',
    `Industry context: ${input.industry}.`,
    `Brand mood: ${tones.join(', ')}.`,
    `Aesthetic: ${recommendedStyle}.`,
    packDirective ? `Surface treatment: ${packDirective}` : '',
    `Color palette: ${colors.join(', ')}.`,
    'No text, no logos, no watermarks. Award-winning craft, studio masterclass lighting, art-director composition, gallery-quality finish. No AI-photo look, no plastic skin, no warped geometry.',
  ].filter(Boolean)

  let prompt = parts.join(' ')
  if (prompt.length > MOOD_PROMPT_LIMIT - 20) {
    prompt = prompt.slice(0, MOOD_PROMPT_LIMIT - 23) + '...'
  }
  return prompt
}
