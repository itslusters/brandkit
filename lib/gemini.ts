import 'server-only'
import type { BrandInput, BrandResult, LogoType, IterationModifier } from './types'
import { getStylePack } from './style-packs'

import { hexToColorName } from './colors'
export { hexToColorName }

// Note: GoogleGenAI used to be instantiated here, but nothing in the app
// runtime calls it. Gemini still ships as a dependency because the one-off
// scripts in `scripts/generate-*.ts` use it directly with GEMINI_API_KEY.

// Each description leads with what the output IS (positive ONLY-clauses) rather
// than what it isn't — Recraft V3 follows positive instructions far more
// reliably than negative ones. The same type constraint is restated as a short
// end-cap (LOGO_TYPE_END_CAP) so the model sees it at both prompt boundaries,
// which empirically helps it distinguish wordmark from symbol-text from emblem.
const LOGO_TYPE_DESCRIPTIONS: Record<LogoType, string> = {
  'wordmark': 'WORDMARK ONLY — pure typography logo. The entire output is the brand name rendered as stylized lettering filling the frame. The letterforms ARE the whole composition. NO accompanying icon, NO symbol next to the type, NO enclosing shape around the text.',
  'symbol-text': 'COMBINATION MARK — two visible parts working as a lockup: (1) a single distinct abstract icon or symbol, (2) the brand name as separate typography next to it. Icon and text are adjacent, not fused. Both elements equally crafted.',
  'emblem': 'EMBLEM badge logo — the brand name is fully enclosed inside ONE continuous outer container shape (circle, shield, hexagon, badge border, or heraldic crest). The outer shape wraps around all the text and is the dominant load-bearing visual element. Heritage badge composition.',
}

const LOGO_TYPE_END_CAP: Record<LogoType, string> = {
  'wordmark': 'Reconfirm: typography only — zero icons, zero symbols, zero enclosing shapes.',
  'symbol-text': 'Reconfirm: icon and wordmark visible side by side as separate elements.',
  'emblem': 'Reconfirm: every text element sits inside one continuous outer container.',
}

// Each variant pulls a different lever — composition, typography, palette
// emphasis — so three generations of the same brand land in noticeably
// different territory instead of three near-duplicates with the same hue mix.
const VARIATION_AXES: Array<{
  composition: string
  typography: string
  palette: (colors: string[]) => string
}> = [
  {
    composition: 'bold asymmetric composition with dramatic negative space, off-center anchor',
    typography: 'serif typography, condensed and heavy, magazine-headline presence',
    palette: (c) => `primary ${c[0]}, accents in ${c.slice(1).filter(Boolean).join(' and ') || c[0]}`,
  },
  {
    composition: 'ultra-minimal layout, single defining gesture, maximum restraint, generous whitespace',
    typography: 'geometric sans-serif, low contrast, modern engineered proportions',
    palette: (c) => `monochrome — only ${c[0]} on a clean ground, no other hues`,
  },
  {
    composition: 'editorial-leaning layout, unconventional spacing, expressive scale shifts',
    typography: 'display type, expressive and unusual, signature character',
    palette: (c) => `inverted — ${c[1] ?? c[0]} as the ground with ${c[0]} marks${c[2] ? `, ${c[2]} accent` : ''}`,
  },
]

// Atriium house aesthetic — injected silently into every logo prompt.
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
  const variant = VARIATION_AXES[variationIndex] ?? VARIATION_AXES[0]

  // Type constraint is bookended (start + end-cap) so it survives the middle
  // brand-context block. Recraft V3 has a 1000-char limit; descriptions are
  // sized to leave room for the brand-specific middle.
  const parts = [
    LOGO_TYPE_DESCRIPTIONS[logoType],
    `Brand: "${selectedName}".`,
    `Typography: ${variant.typography}.`,
    `Composition: ${variant.composition}.`,
    `Palette: ${variant.palette(colors)}.`,
    `Aesthetic: ${recommendedStyle}.`,
    packDirective ? `Mood: ${packDirective}` : '',
    iterationModifier ? ITERATION_MODIFIERS[iterationModifier] : '',
    `Only word visible: "${selectedName}". No other text, watermarks, captions, hex codes, or annotations.`,
    avoidList.length > 0 ? `Avoid: ${avoidList.slice(0, 5).join(', ')}.` : '',
    LOGO_TYPE_END_CAP[logoType],
    'Flat 2D vector, white background, crisp edges, print-ready.',
  ].filter(Boolean)

  let prompt = parts.join(' ')
  if (prompt.length > RECRAFT_PROMPT_LIMIT - 20) {
    prompt = prompt.slice(0, RECRAFT_PROMPT_LIMIT - 23) + '...'
  }
  return prompt
}
