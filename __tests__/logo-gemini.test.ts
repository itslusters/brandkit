// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildLogoPrompt } from '@/lib/gemini'
import { STYLE_PACKS } from '@/lib/style-packs'
import type { BrandInput, BrandResult } from '@/lib/types'

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

describe('buildLogoPrompt (Imagen)', () => {
  it('includes the brand name', () => {
    expect(buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)).toContain('Nexio')
  })

  it('describes the logo type per type', () => {
    expect(buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0).toLowerCase()).toContain('wordmark')
    expect(buildLogoPrompt(input, result, 'Nexio', 'symbol-text', 0).toLowerCase()).toContain('symbol')
    expect(buildLogoPrompt(input, result, 'Nexio', 'emblem', 0).toLowerCase()).toContain('emblem')
  })

  // --- Imagen text-leak defenses: Imagen renders shouted directives as image text ---
  it('states the brand name is the ONLY text', () => {
    const p = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0).toLowerCase()
    expect(p).toContain('only text')
  })

  it('never emits leak-prone uppercase directive labels', () => {
    for (const type of ['wordmark', 'symbol-text', 'emblem'] as const) {
      const p = buildLogoPrompt(input, result, 'Nexio', type, 0)
      expect(p).not.toContain('WORDMARK ONLY')
      expect(p).not.toContain('IDENTITY:')
      expect(p).not.toContain('Reconfirm')
    }
  })

  it('does not leak raw hex codes (Imagen renders them as text)', () => {
    expect(buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)).not.toContain('#')
  })

  it('translates palette to descriptive color names', () => {
    const p = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0).toLowerCase()
    expect(p).toMatch(/orange/)
    expect(p).toMatch(/off-white/)
  })

  it('includes brief avoid-list items', () => {
    expect(buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0)).toContain('그라디언트 남용')
  })

  it('threads variation character (0 asymmetric, 1 minimal, 2 expressive)', () => {
    expect(buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0).toLowerCase()).toContain('asymmetric')
    expect(buildLogoPrompt(input, result, 'Nexio', 'wordmark', 1).toLowerCase()).toContain('minimal')
    expect(buildLogoPrompt(input, result, 'Nexio', 'wordmark', 2).toLowerCase()).toContain('expressive')
  })

  it('threads industry CHARACTER (not a leak-prone label) so logos differ by category', () => {
    const saas = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0).toLowerCase()
    expect(saas).toMatch(/geometric|monoline/)
    const food = buildLogoPrompt({ ...input, industry: 'Bakery & Cafe' }, result, 'Nexio', 'wordmark', 0).toLowerCase()
    expect(food).toMatch(/warm|organic|appetite/)
    const wellness = buildLogoPrompt({ ...input, industry: 'Wellness coaching' }, result, 'Nexio', 'wordmark', 0).toLowerCase()
    expect(wellness).toMatch(/calm|breathing|soft/)
  })

  it('threads brand tones, omitting the voice line when empty', () => {
    const withTones = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0).toLowerCase()
    expect(withTones).toContain('minimal')
    expect(withTones).toContain('trusted')
    const noTones = buildLogoPrompt({ ...input, tones: [] }, result, 'Nexio', 'wordmark', 0)
    expect(noTones).not.toContain('Brand voice:')
  })

  it('defends against human figures and vintage scripts', () => {
    const p = buildLogoPrompt(input, result, 'Nexio', 'wordmark', 0).toLowerCase()
    expect(p).toContain('illustrated human figures')
    expect(p).toContain('vintage script')
  })

  it('demotes stylePack to a surface treatment, not brand framing', () => {
    const p = buildLogoPrompt({ ...input, stylePack: 'editorial' }, result, 'Nexio', 'wordmark', 0)
    expect(p).toContain('Surface treatment:')
    expect(p).not.toContain('Editorial luxury brand')
  })

  it('stays under the Imagen prompt cap with the avoid list intact', () => {
    for (const pack of STYLE_PACKS) {
      for (const logoType of ['wordmark', 'symbol-text', 'emblem'] as const) {
        const p = buildLogoPrompt({ ...input, stylePack: pack.id }, result, 'Nexio', logoType, 0)
        expect(p.length).toBeLessThanOrEqual(2000)
        expect(p).toContain('그라디언트 남용')
      }
    }
  })
})
