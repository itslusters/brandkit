import { GoogleGenAI } from '@google/genai'
import type { BrandInput, BrandResult, LogoType, IterationModifier } from './types'

export const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const LOGO_TYPE_DESCRIPTIONS: Record<LogoType, string> = {
  'wordmark': 'wordmark — only the brand name rendered in stylized type, no symbol or icon',
  'symbol-text': 'combination mark — a single distinct icon or symbol next to the brand name',
  'emblem': 'emblem — the brand name enclosed within a single badge or shield shape',
}

const VARIATION_HINTS = [
  'centered balanced layout',
  'compact horizontal arrangement',
  'stacked vertical composition',
]

// BrandKit house aesthetic — injected silently into every logo prompt.
// Job: force the model toward the polish bar of Pentagram / Apple / Linear
// and away from the AI-image cliches that make vanilla Imagen outputs
// read as "AI-generated": rainbow gradients, generic tech swoosh, chromatic
// aberration, 3D renders, over-ornamented scripts, busy compositions.
const HOUSE_AESTHETIC =
  'Editorial-grade brand design, studio-level polish, confident simplicity, purposeful negative space, refined restraint. Think Pentagram, Collins, Apple, Linear, Stripe — not stock logo maker output. Modern, timeless, enduring.'

const HOUSE_AVOID =
  'rainbow gradients, generic tech swooshes, abstract globes, cliche lightbulbs, chromatic aberration, 3D bevels, lens flares, metallic gloss, drop shadows, over-ornamented scripts, busy arrangements, clip-art styling, stock logo marketplace look'

function tonePrefix(l: number, s: number): string {
  let lightness = ''
  if (l < 0.2) lightness = 'very dark '
  else if (l < 0.4) lightness = 'dark '
  else if (l > 0.85) lightness = 'very light '
  else if (l > 0.7) lightness = 'light '
  if (s < 0.4) return lightness ? `muted ${lightness}` : 'muted '
  return lightness
}

export function hexToColorName(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 510
  const d = max - min
  const s = d === 0 ? 0 : d / (255 - Math.abs(max + min - 255))

  if (s < 0.12) {
    if (l < 0.08) return 'black'
    if (l < 0.3) return 'dark gray'
    if (l < 0.7) return 'gray'
    if (l < 0.92) return 'light gray'
    return 'off-white'
  }

  let hue = 0
  if (max === r) hue = ((g - b) / d + 6) % 6
  else if (max === g) hue = (b - r) / d + 2
  else hue = (r - g) / d + 4
  hue = Math.round(hue * 60)

  if (hue >= 345 || hue < 15) return tonePrefix(l, s) + 'red'
  if (hue < 45) {
    if (l < 0.3 && s > 0.2) return 'brown'
    if (l > 0.85) return 'cream'
    if (l > 0.6 && s < 0.5) return 'beige'
    return tonePrefix(l, s) + 'orange'
  }
  if (hue < 65) return l < 0.4 ? 'olive' : tonePrefix(l, s) + 'yellow'
  if (hue < 150) return tonePrefix(l, s) + 'green'
  if (hue < 200) return tonePrefix(l, s) + 'teal'
  if (hue < 250) return tonePrefix(l, s) + 'blue'
  if (hue < 290) return tonePrefix(l, s) + 'purple'
  return tonePrefix(l, s) + 'pink'
}

export const ITERATION_MODIFIERS: Record<IterationModifier, string> = {
  bolder: 'Make it noticeably bolder, heavier weight, more visual presence.',
  minimal: 'Make it more minimal, simpler, more refined, fewer elements.',
  geometric: 'More geometric, sharper angles, mathematical precision.',
  organic: 'More organic, softer curves, hand-drawn feel.',
  playful: 'More playful, energetic, unexpected.',
}

export function buildLogoPrompt(
  input: BrandInput,
  result: BrandResult,
  selectedName: string,
  logoType: LogoType,
  variationIndex: number,
  iterationModifier?: IterationModifier
): string {
  const { colorPalette, avoidList, recommendedStyle } = result.styleBrief
  const colors = colorPalette.map(hexToColorName)
  const modifier = iterationModifier ? `\nRefinement direction: ${ITERATION_MODIFIERS[iterationModifier]}` : ''
  return `A logo for the brand "${selectedName}".
Logo type: ${LOGO_TYPE_DESCRIPTIONS[logoType]}.
House aesthetic: ${HOUSE_AESTHETIC}
Brand aesthetic direction: ${recommendedStyle}.
Color palette: primarily ${colors[0]}, with ${colors[1]} as secondary and ${colors[2]} as accent. Use only these colors.
Layout: ${VARIATION_HINTS[variationIndex]}.
Avoid: ${[...avoidList, HOUSE_AVOID].join(', ')}.${modifier}
The ONLY visible text in the image is the word "${selectedName}". Do not render any hex codes, color codes, font names, font samples, color swatches, labels, captions, taglines, watermarks, or annotations of any kind.
White background. Pure vector feel. Crisp edges. High contrast. Print-ready. Flat 2D — absolutely no 3D rendering, no photorealism, no texture.`
}
