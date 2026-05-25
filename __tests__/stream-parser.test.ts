// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildBrandPrompt, parseNamingCandidates, parseStyleBrief } from '@/lib/claude'
import type { BrandInput, StyleBrief } from '@/lib/types'

const mockInput: BrandInput = {
  companyName: 'TestCo',
  industry: 'SaaS / Software',
  targetCustomer: 'Startup founders who need fast branding',
  tones: ['Bold', 'Minimal', 'Trusted'],
  competitor: 'Notion',
}

describe('buildBrandPrompt', () => {
  it('includes company name', () => {
    expect(buildBrandPrompt(mockInput)).toContain('TestCo')
  })
  it('includes all three tones', () => {
    const p = buildBrandPrompt(mockInput)
    expect(p).toContain('Bold')
    expect(p).toContain('Minimal')
    expect(p).toContain('Trusted')
  })
  it('includes competitor', () => {
    expect(buildBrandPrompt(mockInput)).toContain('Notion')
  })
  it('uses "none" when competitor is empty', () => {
    expect(buildBrandPrompt({ ...mockInput, competitor: '' })).toContain('none')
  })
  it('includes all three section delimiters', () => {
    const p = buildBrandPrompt(mockInput)
    expect(p).toContain('[INDUSTRY_START]')
    expect(p).toContain('[NAMING_START]')
    expect(p).toContain('[BRIEF_START]')
  })
})

describe('parseNamingCandidates', () => {
  const raw = [
    'Nexio|테크 스타트업 느낌의 간결한 이름',
    'Veltro|속도감을 암시하는 조합어',
    'Clyra|세련된 음감의 미니멀 이름',
    'Foundr|창업 정체성을 직접 반영',
    'Arkos|신뢰감 있는 클래식한 이름',
  ].join('\n')

  it('returns exactly 5 candidates', () => {
    expect(parseNamingCandidates(raw)).toHaveLength(5)
  })
  it('parses name from first segment', () => {
    expect(parseNamingCandidates(raw)[0].name).toBe('Nexio')
  })
  it('parses rationale from second segment', () => {
    expect(parseNamingCandidates(raw)[0].rationale).toBe('테크 스타트업 느낌의 간결한 이름')
  })
  it('ignores blank lines', () => {
    expect(parseNamingCandidates('\n' + raw + '\n')).toHaveLength(5)
  })
  it('ignores lines without pipe separator', () => {
    expect(parseNamingCandidates('header\n' + raw)).toHaveLength(5)
  })
})

describe('parseStyleBrief', () => {
  const validBrief: StyleBrief = {
    recommendedStyle: 'Geometric Minimal',
    colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
    typography: ['Inter — primary', 'Playfair Display — accent'],
    avoidList: ['그라디언트 남용', '네온 컬러', '둥근 캐릭터 일러스트'],
    recommendedMockups: ['business-card', 'app-icon', 'social-post'],
  }

  it('parses valid JSON string', () => {
    expect(parseStyleBrief(JSON.stringify(validBrief))).toEqual(validBrief)
  })
  it('handles leading/trailing whitespace', () => {
    expect(parseStyleBrief('  ' + JSON.stringify(validBrief) + '\n')).toEqual(validBrief)
  })
  it('throws on invalid JSON', () => {
    expect(() => parseStyleBrief('not json')).toThrow()
  })
  it('throws on structurally incomplete JSON', () => {
    expect(() => parseStyleBrief(JSON.stringify({ recommendedStyle: 'x' }))).toThrow()
  })
  it('extracts JSON from markdown fence', () => {
    const raw = '```json\n' + JSON.stringify(validBrief) + '\n```'
    expect(parseStyleBrief(raw)).toEqual(validBrief)
  })
  it('ignores trailing explanation after the JSON object', () => {
    const raw = JSON.stringify(validBrief) + '\n\nThis brief positions the brand for…'
    expect(parseStyleBrief(raw)).toEqual(validBrief)
  })
  it('ignores trailing stray punctuation/objects', () => {
    const raw = JSON.stringify(validBrief) + '}\n{"foo":"bar"}'
    expect(parseStyleBrief(raw)).toEqual(validBrief)
  })
  it('respects nested braces inside string values', () => {
    const brief = { ...validBrief, recommendedStyle: 'use {curly} braces deliberately' }
    expect(parseStyleBrief(JSON.stringify(brief))).toEqual(brief)
  })
})
