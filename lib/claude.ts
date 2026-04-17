import Anthropic from '@anthropic-ai/sdk'
import type { BrandInput, NamingCandidate, StyleBrief } from './types'
import { getStylePack } from './style-packs'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export function buildBrandPrompt(input: BrandInput): string {
  const skipNaming = !!input.existingName?.trim()
  const tones = [input.tones.join(', '), input.customTone?.trim()].filter(Boolean).join('. Also: ')
  const hasMoodImage = !!input.moodImageDataUrl

  const namingSection = skipNaming
    ? ''
    : `\n[NAMING_START]
Output exactly 5 lines. Each line format: Name|One-sentence rationale in English. No numbering. No blank lines between entries.\n`

  const nameLine = skipNaming
    ? `Brand name (already chosen): ${input.existingName!.trim()}`
    : `Company: ${input.companyName}`

  const stylePackDirective = input.stylePack
    ? `\nStyle pack selected: ${getStylePack(input.stylePack)?.promptDirective ?? ''}`
    : ''

  const moodImageNote = hasMoodImage
    ? '\nA reference image is attached — use it as primary visual inspiration for the color palette, typography mood, and recommendedStyle. Match the energy and aesthetic of the image.'
    : ''

  return `You are a brand strategist. Analyze the following company and output exactly ${skipNaming ? 'two' : 'three'} sections using the delimiters below. No preamble, no text outside the sections.

${nameLine}
Industry: ${input.industry}
Target customer: ${input.targetCustomer}
Brand tone: ${tones}
Competitor reference: ${input.competitor || 'none'}${stylePackDirective}${moodImageNote}

[INDUSTRY_START]
Write 1-2 sentences: the industry archetype and the aesthetic expectations startup founders in this space should meet.
${namingSection}
[BRIEF_START]
Output valid JSON only — no markdown fences, no explanation. Use this exact schema:
{"recommendedStyle":string,"colorPalette":[3 hex strings],"typography":[2 strings],"avoidList":[3 English strings],"moodImages":[3 strings chosen only from: minimal-tech-1, minimal-tech-2, minimal-tech-3, bold-modern-1, bold-modern-2, bold-modern-3, warm-organic-1, warm-organic-2, warm-organic-3, premium-dark-1, premium-dark-2, premium-dark-3, playful-bright-1, playful-bright-2, playful-bright-3],"recommendedMockups":[3 strings chosen only from: business-card, app-icon, social-post, envelope-small, envelope-large, letterhead, tshirt, mug, pen — pick based on industry and audience]}`
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
    'recommendedStyle', 'colorPalette', 'typography', 'avoidList', 'moodImages', 'recommendedMockups'
  ]
  for (const key of required) {
    if (parsed[key] === undefined) throw new Error(`StyleBrief missing field: ${key}`)
  }
  const filtered = (parsed.recommendedMockups as string[]).filter((id) => VALID_MOCKUP_IDS.includes(id))
  parsed.recommendedMockups = filtered.length >= 3 ? filtered.slice(0, 3) : ['business-card', 'app-icon', 'social-post']
  return parsed as StyleBrief
}
