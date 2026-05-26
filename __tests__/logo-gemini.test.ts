// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildLogoPrompt } from '@/lib/gemini'
import { STYLE_PACKS } from '@/lib/style-packs'
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
    expect(prompt.toLowerCase()).toContain('wordmark')
  })

  it('includes symbol-and-text description for symbol-text type', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'symbol-text', 0)
    expect(prompt.toLowerCase()).toContain('symbol')
  })

  it('includes emblem description for emblem type', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'emblem', 0)
    expect(prompt.toLowerCase()).toContain('emblem')
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

  it('includes variation hint — variation 1 leans minimal', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 1)
    expect(prompt.toLowerCase()).toContain('minimal')
  })

  it('includes variation hint — variation 2 is expressive (industry-agnostic)', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 2)
    expect(prompt.toLowerCase()).toContain('expressive')
  })

  it('threads industry into the prompt so logos differ across categories', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt).toContain('SaaS B2B')
  })

  it('threads brand tones into the prompt', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt.toLowerCase()).toContain('minimal')
    expect(prompt.toLowerCase()).toContain('trusted')
    expect(prompt.toLowerCase()).toContain('bold')
  })

  it('omits the brand voice line when tones are empty', () => {
    const noToneInput: BrandInput = { ...input, tones: [] }
    const prompt = buildLogoPrompt(noToneInput, result, 'Nexio', 'wordmark', 0)
    expect(prompt).not.toContain('Brand voice:')
  })

  it('emits a tech industry anchor for SaaS so Recraft locks the category early', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt).toContain('TECH-PRODUCT IDENTITY')
  })

  it('emits a food anchor for food industries', () => {
    const foodInput: BrandInput = { ...input, industry: 'Bakery & Cafe' }
    const prompt = buildLogoPrompt(foodInput, result, 'Nexio', 'wordmark', 0)
    expect(prompt).toContain('FOOD & BEVERAGE IDENTITY')
  })

  it('emits a wellness anchor for wellness industries', () => {
    const wellnessInput: BrandInput = { ...input, industry: 'Wellness coaching' }
    const prompt = buildLogoPrompt(wellnessInput, result, 'Nexio', 'wordmark', 0)
    expect(prompt).toContain('WELLNESS IDENTITY')
  })

  it('emits no anchor for industries outside the curated set', () => {
    const otherInput: BrandInput = { ...input, industry: 'Marine logistics' }
    const prompt = buildLogoPrompt(otherInput, result, 'Nexio', 'wordmark', 0)
    expect(prompt).not.toContain('IDENTITY:')
  })

  it('defends against human figures and vintage scripts via HOUSE_AVOID', () => {
    const prompt = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)
    expect(prompt.toLowerCase()).toContain('illustrated human figures')
    expect(prompt.toLowerCase()).toContain('vintage script')
  })

  it('demotes stylePack to surface treatment, not a brand framing', () => {
    const editorialInput: BrandInput = { ...input, stylePack: 'editorial' }
    const prompt = buildLogoPrompt(editorialInput, result, 'Nexio', 'wordmark', 0)
    // The directive label should read "Surface treatment", not "Mood",
    // because the prior framing was strong enough to override industry.
    expect(prompt).toContain('Surface treatment:')
    expect(prompt).not.toContain('Editorial luxury brand')
    expect(prompt).not.toContain('Monocle')
  })

  // Recraft V3 caps prompts at 1000 chars. Prior revision overflowed and
  // truncated HOUSE_AVOID + the avoid list — keep regression coverage.
  for (const pack of STYLE_PACKS) {
    for (const logoType of ['wordmark', 'symbol-text', 'emblem'] as const) {
      it(`stays under Recraft cap (pack=${pack.id}, type=${logoType})`, () => {
        const packInput: BrandInput = { ...input, stylePack: pack.id }
        const prompt = buildLogoPrompt(packInput, result, 'Nexio', logoType, 0)
        expect(prompt.length).toBeLessThanOrEqual(1000)
        // And the avoid list must survive at the tail.
        expect(prompt).toContain('그라디언트 남용')
      })
    }
  }
})
