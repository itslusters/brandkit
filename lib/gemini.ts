import 'server-only'
import { GoogleGenAI } from '@google/genai'
import type { BrandInput, BrandResult, LogoType, IterationModifier } from './types'
import { getStylePack } from './style-packs'

import { hexToColorName } from './colors'
export { hexToColorName }

export const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// Each description is written as a hard structural contract — not a hint. When a
// trained Recraft style is applied, it will pull every variation toward the
// reference aesthetic; these descriptions have to fight that by explicitly
// naming what must and must not appear in the frame so the three logo types
// remain visually distinguishable even under a dominant trained style.
const LOGO_TYPE_DESCRIPTIONS: Record<LogoType, string> = {
  'wordmark': 'PURE TYPOGRAPHY WORDMARK. Only the brand name rendered as stylized lettering. No icons, no symbols, no graphic marks, no enclosing shapes, no borders, no badges — nothing but the letterforms themselves, arranged as a single refined typographic composition on a clean background.',
  'symbol-text': 'COMBINATION MARK. A single distinct abstract icon or symbol as the primary graphic element, positioned adjacent to the brand name set in clean supporting type. Icon and wordmark are clearly separate — not fused, not overlapping. The icon carries the visual idea; the type identifies the brand.',
  'emblem': 'ENCLOSED EMBLEM LOGO. The brand name fully contained inside one defined outer shape — circle, shield, hexagon, rounded rectangle, or heraldic crest. The enclosing container is a load-bearing structural element, visible and continuous. All text and decoration lives inside that shape. Heritage badge energy.',
}

const VARIATION_HINTS = [
  'bold asymmetric composition with dramatic negative space',
  'ultra-minimal, single defining gesture, maximum restraint',
  'editorial-leaning layout, unconventional spacing, expressive scale',
]

// Kiln house aesthetic — injected silently into every logo prompt.
// Job: force the model toward the polish bar of Pentagram / Apple / Linear
// and away from the AI-image cliches that make vanilla Imagen outputs
// read as "AI-generated": rainbow gradients, generic tech swoosh, chromatic
// aberration, 3D renders, over-ornamented scripts, busy compositions.
const HOUSE_AESTHETIC =
  'World-class brand identity, Behance/Dribbble Featured level. Bold confident typography, purposeful negative space, strong color commitment (not timid pastels). Think: A24 title cards, Pentagram case studies, Collins identity systems, Apple keynote graphics. Every element is intentional. Composition reads as editorial, not templated. Type is the hero — large, decisive, expressive.'

const HOUSE_AVOID =
  'rainbow gradients, generic tech swooshes, abstract globes, cliche lightbulbs, chromatic aberration, 3D bevels, lens flares, metallic gloss, drop shadows, over-ornamented scripts, busy arrangements, clip-art styling, stock logo marketplace look, generic startup logo feel, safe boring layouts, centered-everything syndrome, thin wimpy type, watermark-ish transparency'

export const ITERATION_MODIFIERS: Record<IterationModifier, string> = {
  bolder: 'Make it noticeably bolder, heavier weight, more visual presence.',
  minimal: 'Make it more minimal, simpler, more refined, fewer elements.',
  geometric: 'More geometric, sharper angles, mathematical precision.',
  organic: 'More organic, softer curves, hand-drawn feel.',
  playful: 'More playful, energetic, unexpected.',
}

const RECRAFT_PROMPT_LIMIT = 1000

export function buildLogoPrompt(
  input: BrandInput,
  result: BrandResult,
  selectedName: string,
  logoType: LogoType,
  variationIndex: number,
  iterationModifier?: IterationModifier
): string {
  const { colorPalette, avoidList, recommendedStyle } = result.styleBrief
  const colors = colorPalette.slice(0, 3).map(hexToColorName)
  const packDirective = input.stylePack ? getStylePack(input.stylePack)?.promptDirective ?? '' : ''

  // Compact prompt — Recraft V3 has a 1000-char limit and its vector_illustration
  // style already enforces the brand-quality aesthetic (doubly so when a custom
  // trained style_id is used). HOUSE_AESTHETIC/HOUSE_AVOID constants above are
  // kept only as reference documentation; they're no longer injected.
  const parts = [
    `Brand logo for "${selectedName}". ${LOGO_TYPE_DESCRIPTIONS[logoType]}.`,
    `Style: ${recommendedStyle}.`,
    packDirective ? `Mood: ${packDirective}` : '',
    `Colors: ${colors.join(', ')} only.`,
    `Layout: ${VARIATION_HINTS[variationIndex]}.`,
    iterationModifier ? ITERATION_MODIFIERS[iterationModifier] : '',
    `Only text is "${selectedName}". No other text, watermarks, captions, hex codes, or annotations.`,
    avoidList.length > 0 ? `Avoid: ${avoidList.slice(0, 5).join(', ')}.` : '',
    'Flat 2D vector, white background, crisp edges, print-ready.',
  ].filter(Boolean)

  let prompt = parts.join(' ')
  if (prompt.length > RECRAFT_PROMPT_LIMIT - 20) {
    prompt = prompt.slice(0, RECRAFT_PROMPT_LIMIT - 23) + '...'
  }
  return prompt
}
