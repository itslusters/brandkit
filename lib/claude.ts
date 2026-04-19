import Anthropic from '@anthropic-ai/sdk'
import type { BrandInput, NamingCandidate, StyleBrief } from './types'
import { getStylePack } from './style-packs'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * True if any of the user-provided strings contain Hangul — we use this to
 * auto-switch Claude into a bilingual mode where naming candidates stay
 * Korean and the brief copy is written in Korean while the JSON structure
 * (including color hex / font names) stays English-parseable.
 */
function hasHangul(s: string | undefined): boolean {
  if (!s) return false
  return /[\u3131-\u318E\uAC00-\uD7A3]/.test(s)
}

export function buildBrandPrompt(input: BrandInput): string {
  const skipNaming = !!input.existingName?.trim()
  const tones = [input.tones.join(', '), input.customTone?.trim()].filter(Boolean).join('. Also: ')

  const isKorean = hasHangul(input.companyName) ||
    hasHangul(input.existingName) ||
    hasHangul(input.targetCustomer) ||
    hasHangul(input.customTone)

  const namingRule = isKorean
    ? `Output exactly 5 lines. Each line format: KoreanName|한 줄 이유. Brand names should read naturally in Korean (2~5 letter Hangul or hybrid like "테일즈" / "Pickd"). Rationale is in Korean (한국어). No numbering. No blank lines between entries.`
    : `Output exactly 5 lines. Each line format: Name|One-sentence rationale in English. No numbering. No blank lines between entries.`

  const namingSection = skipNaming ? '' : `\n[NAMING_START]\n${namingRule}\n`

  const industryRule = isKorean
    ? '1~2 문장으로 한국어로 작성: 이 산업의 원형과 창업자가 맞춰야 할 시각적 기대.'
    : 'Write 1-2 sentences: the industry archetype and the aesthetic expectations startup founders in this space should meet.'

  const nameLine = skipNaming
    ? `Brand name (already chosen): ${input.existingName!.trim()}`
    : `Company: ${input.companyName}`

  const stylePackDirective = input.stylePack
    ? `\nStyle pack selected: ${getStylePack(input.stylePack)?.promptDirective ?? ''}`
    : ''

  // `recommendedStyle` and `typography` stay English-readable so downstream
  // satori/Recraft prompts (English-trained) can consume them without
  // translation. `avoidList` flips to Korean when brand is Korean so users
  // see recognizable cautions in their own language.
  const avoidLang = isKorean ? 'Korean' : 'English'

  return `You are a brand strategist. Analyze the following company and output exactly ${skipNaming ? 'two' : 'three'} sections using the delimiters below. No preamble, no text outside the sections.

${nameLine}
Industry: ${input.industry}
Target customer: ${input.targetCustomer}
Brand tone: ${tones}
Competitor reference: ${input.competitor || 'none'}${stylePackDirective}

[INDUSTRY_START]
${industryRule}
${namingSection}
[BRIEF_START]
Output valid JSON only — no markdown fences, no explanation. Use this exact schema:
{"recommendedStyle":string (English, descriptive),"colorPalette":[3 hex strings],"typography":[2 English font stack strings],"avoidList":[3 ${avoidLang} strings],"recommendedMockups":[3 strings chosen only from: business-card, app-icon, social-post, envelope-small, envelope-large, letterhead, tshirt, mug, pen — pick based on industry and audience]}`
}

export function parseNamingCandidates(raw: string): NamingCandidate[] {
  return raw
    .split('\n')
    .filter(line => line.includes('|'))
    .map(line => {
      const idx = line.indexOf('|')
      return {
        name: line.slice(0, idx).trim(),
        rationale: line.slice(idx + 1).trim(),
      }
    })
}

const VALID_MOCKUP_IDS = ['business-card', 'app-icon', 'social-post', 'envelope-small', 'envelope-large', 'letterhead', 'tshirt', 'mug', 'pen']

export function parseStyleBrief(raw: string): StyleBrief {
  const parsed = JSON.parse(raw.trim())
  const required: (keyof StyleBrief)[] = [
    'recommendedStyle', 'colorPalette', 'typography', 'avoidList', 'recommendedMockups'
  ]
  for (const key of required) {
    if (parsed[key] === undefined) throw new Error(`StyleBrief missing field: ${key}`)
  }
  const filtered = (parsed.recommendedMockups as string[]).filter((id) => VALID_MOCKUP_IDS.includes(id))
  parsed.recommendedMockups = filtered.length >= 3 ? filtered.slice(0, 3) : ['business-card', 'app-icon', 'social-post']
  return parsed as StyleBrief
}
