import 'server-only'
import type { BrandInput, BrandResult, LogoType, IterationModifier } from './types'
import { getStylePack } from './style-packs'
import { industryAnchor, industryTypefaceHint, industryRenderHint } from './industry-anchor'

import { hexToColorName } from './colors'
export { hexToColorName }

// Note: GoogleGenAI used to be instantiated here, but nothing in the app
// runtime calls it. Gemini still ships as a dependency because the one-off
// scripts in `scripts/generate-*.ts` use it directly with GEMINI_API_KEY.

// Each description leads with what the output IS (positive ONLY-clauses) — Recraft
// follows positive instructions more reliably than negative ones. Bookended with a
// short end-cap so the type constraint survives the brand-context middle.
// Compressed in this revision to leave room for industryAnchor + HOUSE signals
// under Recraft V3's 1000-char prompt cap.
const LOGO_TYPE_DESCRIPTIONS: Record<LogoType, string> = {
  'wordmark': 'WORDMARK ONLY — pure typography logo. Brand name as stylized lettering fills the frame. NO icon, NO symbol, NO enclosing shape.',
  'symbol-text': 'COMBINATION MARK — one distinct abstract icon or symbol plus the brand name as adjacent typography. Both equally crafted, not fused.',
  'emblem': 'EMBLEM badge — brand name fully enclosed inside one continuous outer container shape (circle, shield, hexagon, badge border).',
}

const LOGO_TYPE_END_CAP: Record<LogoType, string> = {
  'wordmark': 'Reconfirm: typography only, zero icons.',
  'symbol-text': 'Reconfirm: icon and wordmark side by side.',
  'emblem': 'Reconfirm: all text inside one container.',
}

// Three industry-agnostic variant levers — weight, restraint, expressiveness
// — so three generations land in different territory without prescribing a
// typeface family. Family choice (serif vs sans, monospace, display) is left
// to industryAnchor + brief so it actually fits the category. The earlier
// version hard-coded "serif typography, condensed and heavy, magazine-headline"
// in variant 0, which dragged every brand toward an editorial vibe regardless
// of input.
const VARIATION_AXES: Array<{
  composition: string
  typography: string
  palette: (colors: string[]) => string
}> = [
  {
    composition: 'bold asymmetric, dramatic negative space, off-center anchor',
    typography: 'extra-heavy weight, dominant scale, high contrast',
    palette: (c) => `primary ${c[0]}, accents in ${c.slice(1).filter(Boolean).join(' and ') || c[0]}`,
  },
  {
    composition: 'ultra-minimal, single defining gesture, generous whitespace',
    typography: 'restrained weight, low contrast, modest scale',
    palette: (c) => `monochrome — only ${c[0]} on a clean ground`,
  },
  {
    composition: 'expressive layout, unconventional spacing, scale shifts',
    typography: 'expressive weight rhythm, signature character',
    palette: (c) => `inverted — ${c[1] ?? c[0]} ground, ${c[0]} marks${c[2] ? `, ${c[2]} accent` : ''}`,
  },
]

// House polish + AI-cliche defense, sized to leave room for the avoid list
// under Recraft V3's 1000-char prompt cap. Grade language pushes toward
// type-designer caliber letterforms; the prior version only said "Pentagram
// polish" without naming the letterform discipline explicitly.
const HOUSE_AESTHETIC =
  'Awwwards-caliber identity. Type-designer-perfect letterforms, optical alignment, deliberate kerning.'

const HOUSE_AVOID =
  'illustrated human figures, hand-drawn mascots, vintage script lettering, garbled letterforms, ornate scripts, 3D bevels, drop shadows, clip-art, generic startup feel, AI-generic look'

// industryAnchor moved to lib/industry-anchor.ts so the same logic drives
// logo + mood + mockup prompts.

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
  const toneLine = (input.tones ?? []).filter(Boolean).slice(0, 3).join(', ')
  const anchor = industryAnchor(input.industry)
  const typefaceHint = industryTypefaceHint(input.industry)
  // Sonnet sometimes emits 200+ char recommendedStyle paragraphs. Clip so the
  // brief signal doesn't push HOUSE_AVOID + END_CAP past Recraft's 1000-char cap.
  const aestheticLine = recommendedStyle.length > 100
    ? recommendedStyle.slice(0, 100).trimEnd() + '…'
    : recommendedStyle

  // Type constraint is bookended (start + end-cap) so it survives the middle
  // brand-context block. Recraft V3 has a 1000-char limit; descriptions are
  // sized to leave room for the brand-specific middle.
  //
  // industryAnchor + industryTypefaceHint sit ahead of `recommendedStyle` so
  // Recraft locks the category and the right letterform family before it
  // reads the brief. The avoid list concatenates the brief's brand-specific
  // avoids with HOUSE_AVOID so we always defend against generic AI cliches
  // + the specific failure modes seen in dogfood (vintage scripts, human
  // figures, garbled letterforms).
  const combinedAvoid = [...avoidList.slice(0, 2), HOUSE_AVOID].filter(Boolean).join(', ')
  const parts = [
    LOGO_TYPE_DESCRIPTIONS[logoType],
    anchor,
    typefaceHint,
    `Brand: "${selectedName}".`,
    `Industry: ${input.industry}.`,
    toneLine ? `Brand voice: ${toneLine}.` : '',
    `Composition: ${variant.composition}.`,
    `Weight: ${variant.typography}.`,
    `Palette: ${variant.palette(colors)}.`,
    `Aesthetic: ${aestheticLine}.`,
    packDirective ? `Surface treatment: ${packDirective}` : '',
    iterationModifier ? ITERATION_MODIFIERS[iterationModifier] : '',
    HOUSE_AESTHETIC,
    `Only word visible: "${selectedName}". No other text, watermarks, captions, hex codes, or annotations.`,
    `Avoid: ${combinedAvoid}.`,
    LOGO_TYPE_END_CAP[logoType],
    industryRenderHint(input.industry),
  ].filter(Boolean)

  let prompt = parts.join(' ')
  if (prompt.length > RECRAFT_PROMPT_LIMIT - 20) {
    prompt = prompt.slice(0, RECRAFT_PROMPT_LIMIT - 23) + '...'
  }
  return prompt
}
