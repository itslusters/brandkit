// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildLogoPrompt } from '@/lib/gemini'
import type { BrandInput, BrandResult, LogoType } from '@/lib/types'

const input: BrandInput = {
  companyName: 'Nexio',
  industry: 'SaaS B2B',
  targetCustomer: 'Startup founders',
  tones: ['minimal', 'trusted', 'bold'],
  competitor: '',
}

const result: BrandResult = {
  industry: 'SaaS B2B archetype',
  namingCandidates: [{ name: 'Nexio', rationale: '테스트' }],
  styleBrief: {
    recommendedStyle: 'Geometric Minimal',
    colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
    typography: ['Inter — primary', 'Playfair Display — accent'],
    avoidList: ['그라디언트 남용', '네온 컬러', '둥근 캐릭터'],
    recommendedMockups: ['business-card', 'app-icon', 'social-post'],
  },
}

describe('buildLogoPrompt', () => {
  it('includes the brand name', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt).toContain('Nexio')
  })

  it('includes wordmark description for wordmark type', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt).toContain('wordmark')
  })

  it('includes symbol-and-text description for symbol-text type', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'symbol-text', 0)
    expect(prompt).toContain('symbol')
  })

  it('includes emblem description for emblem type', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'emblem', 0)
    expect(prompt).toContain('emblem')
  })

  it('does not leak raw hex codes (Imagen renders them as text)', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt).not.toContain('#')
  })

  it('translates palette to descriptive color names', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    // #18181b → dark gray, #ffffff → off-white, #f59e0b → orange
    expect(prompt.toLowerCase()).toMatch(/orange/)
    expect(prompt.toLowerCase()).toMatch(/off-white/)
  })

  it('includes avoid list items', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt).toContain('그라디언트 남용')
  })

  it('includes variation hint — variation 0 is asymmetric', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt.toLowerCase()).toContain('asymmetric')
  })

  it('includes variation hint — variation 1 is monogram', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 1)
    expect(prompt.toLowerCase()).toContain('monogram')
  })

  it('includes variation hint — variation 2 is experimental', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 2)
    expect(prompt.toLowerCase()).toContain('experimental')
  })
})
