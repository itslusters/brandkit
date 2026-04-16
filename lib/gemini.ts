import { GoogleGenAI } from '@google/genai'
import type { BrandInput, BrandResult, LogoType } from './types'

export const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const LOGO_TYPE_DESCRIPTIONS: Record<LogoType, string> = {
  'wordmark': 'wordmark — stylized brand name as text only, no symbol or icon',
  'symbol-text': 'combination mark — a distinct icon or symbol placed alongside the brand name',
  'emblem': 'emblem — brand name enclosed within a badge or shield shape',
}

const VARIATION_HINTS = [
  'centered balanced layout',
  'compact horizontal arrangement',
  'stacked vertical composition',
]

export function buildLogoPrompt(
  input: BrandInput,
  result: BrandResult,
  selectedName: string,
  logoType: LogoType,
  variationIndex: number
): string {
  const { colorPalette, avoidList, recommendedStyle, typography } = result.styleBrief
  return `Professional logo design for a brand named "${selectedName}".
Logo type: ${LOGO_TYPE_DESCRIPTIONS[logoType]}
Style: ${recommendedStyle}
Primary color: ${colorPalette[0]}, Secondary: ${colorPalette[1]}, Accent: ${colorPalette[2]}
Typography direction: ${typography[0]}
Avoid: ${avoidList.join(', ')}
White background. No tagline. No watermark. Print-ready quality.
Variation ${variationIndex + 1} of 3: ${VARIATION_HINTS[variationIndex]}`
}
