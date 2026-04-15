import Anthropic from '@anthropic-ai/sdk'
import type { BrandInput, NamingCandidate, StyleBrief } from './types'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export function buildBrandPrompt(input: BrandInput): string {
  return `You are a brand strategist. Analyze the following company and output exactly three sections using the delimiters below. No preamble, no text outside the sections.

Company: ${input.companyName}
Industry: ${input.industry}
Target customer: ${input.targetCustomer}
Brand tone: ${input.tones.join(', ')}
Competitor reference: ${input.competitor || 'none'}

[INDUSTRY_START]
Write 1-2 sentences: the industry archetype and the aesthetic expectations startup founders in this space should meet.

[NAMING_START]
Output exactly 5 lines. Each line format: Name|One-sentence rationale in Korean. No numbering. No blank lines between entries.

[BRIEF_START]
Output valid JSON only — no markdown fences, no explanation. Use this exact schema:
{"recommendedStyle":string,"colorPalette":[3 hex strings],"typography":[2 strings],"avoidList":[3 Korean strings],"moodImages":[3 strings chosen only from: minimal-tech-1, minimal-tech-2, minimal-tech-3, bold-modern-1, bold-modern-2, bold-modern-3, warm-organic-1, warm-organic-2, warm-organic-3, premium-dark-1, premium-dark-2, premium-dark-3, playful-bright-1, playful-bright-2, playful-bright-3]}`
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

export function parseStyleBrief(raw: string): StyleBrief {
  const parsed = JSON.parse(raw.trim())
  const required: (keyof StyleBrief)[] = [
    'recommendedStyle', 'colorPalette', 'typography', 'avoidList', 'moodImages'
  ]
  for (const key of required) {
    if (parsed[key] === undefined) throw new Error(`StyleBrief missing field: ${key}`)
  }
  return parsed as StyleBrief
}
