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
// Descriptive, lowercase logo-type phrasing. Imagen renders ALL-CAPS directive
// labels (e.g. "WORDMARK ONLY") as literal text INSIDE the logo, so these read
// as natural design descriptions instead of shouted instructions.
const LOGO_TYPE_PHRASE: Record<LogoType, string> = {
  'wordmark': 'a pure typographic wordmark logo — the brand name set as distinctive custom lettering, no icon, no symbol, no enclosing shape',
  'symbol-text': 'a combination-mark logo — one simple distinctive abstract symbol paired beside the brand name in clean type, both equally crafted',
  'emblem': 'an emblem / badge logo — the brand name enclosed inside a single clean container shape (circle, shield, or badge)',
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
  'Award-winning, type-designer-quality letterforms with optical alignment and deliberate kerning. Flat, crisp, scalable, professional brand identity.'

const HOUSE_AVOID =
  'illustrations, illustrated human figures, hand-drawn mascots, scenes, vintage script lettering, garbled letterforms, ornate flourishes, 3D bevels, drop shadows, clip-art, photographic elements, generic startup feel, AI-generic look'

// industryAnchor moved to lib/industry-anchor.ts so the same logic drives
// logo + mood + mockup prompts.

export const ITERATION_MODIFIERS: Record<IterationModifier, string> = {
  bolder: 'Make it noticeably bolder, heavier weight, more visual presence.',
  minimal: 'Make it more minimal, simpler, more refined, fewer elements.',
  geometric: 'More geometric, sharper angles, mathematical precision.',
  organic: 'More organic, softer curves, hand-drawn feel.',
  playful: 'More playful, energetic, unexpected.',
}

const IMAGEN_PROMPT_LIMIT = 2000

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

  // Imagen follows natural-language description and will literally render any
  // shouted directive label ("WORDMARK ONLY", "TECH-PRODUCT IDENTITY:") as text
  // inside the logo. So: no labels, the category anchor has its "X IDENTITY:"
  // prefix stripped to its descriptive clause, hex is pre-translated to color
  // names, and we state plainly that the ONLY text is the brand name.
  const anchorDesc = anchor ? anchor.replace(/^[^:]+:\s*/, '') : ''
  const combinedAvoid = [...avoidList.slice(0, 3), HOUSE_AVOID].filter(Boolean).join(', ')
  const parts = [
    `Design ${LOGO_TYPE_PHRASE[logoType]}.`,
    `The only text anywhere in the image is the single word "${selectedName}" — no taglines, labels, captions, color codes, or any other words.`,
    anchorDesc ? `Category character: ${anchorDesc}` : '',
    typefaceHint,
    toneLine ? `Brand voice: ${toneLine}.` : '',
    `Composition: ${variant.composition}.`,
    `Typography: ${variant.typography}.`,
    `Colors: ${variant.palette(colors)}.`,
    `Overall aesthetic: ${aestheticLine}.`,
    packDirective ? `Surface treatment: ${packDirective}.` : '',
    iterationModifier ? ITERATION_MODIFIERS[iterationModifier] : '',
    HOUSE_AESTHETIC,
    industryRenderHint(input.industry),
    `Do not include: ${combinedAvoid}, or any text other than "${selectedName}".`,
  ].filter(Boolean)

  // Imagen accepts long prompts; keep a generous safety cap well above the
  // ~980-char content so the brand-name-only clause + avoids always survive.
  let prompt = parts.join(' ')
  if (prompt.length > IMAGEN_PROMPT_LIMIT) {
    prompt = prompt.slice(0, IMAGEN_PROMPT_LIMIT - 3) + '...'
  }
  return prompt
}
