// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildMoodPrompt, getMoodById, pickMoodStyle } from '@/lib/mood-templates'
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
  namingCandidates: [],
  styleBrief: {
    recommendedStyle: 'Geometric Minimal',
    colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
    typography: ['Inter — primary', 'Playfair Display — accent'],
    avoidList: ['그라디언트 남용', '네온 컬러', '둥근 캐릭터'],
    recommendedMockups: ['business-card', 'app-icon', 'social-post'],
  },
}

describe('buildMoodPrompt', () => {
  it('opens with the industry anchor so Recraft locks the category early', () => {
    const tpl = getMoodById('lifestyle')!
    const prompt = buildMoodPrompt(input, result, tpl)
    expect(prompt).toContain('TECH-PRODUCT IDENTITY')
  })

  it('still includes the raw industry string', () => {
    const tpl = getMoodById('hero')!
    const prompt = buildMoodPrompt(input, result, tpl)
    expect(prompt).toContain('SaaS B2B')
  })

  it('threads brand tones into the prompt', () => {
    const tpl = getMoodById('hero')!
    const prompt = buildMoodPrompt(input, result, tpl)
    expect(prompt.toLowerCase()).toContain('minimal')
    expect(prompt.toLowerCase()).toContain('trusted')
    expect(prompt.toLowerCase()).toContain('bold')
  })

  it('no longer forces high-end editorial photography on every category', () => {
    const tpl = getMoodById('lifestyle')!
    const prompt = buildMoodPrompt(input, result, tpl)
    // The old footer "High-end editorial photography quality" was leaking
    // magazine framing into non-publishing brands.
    expect(prompt).not.toContain('High-end editorial photography')
  })

  it('falls through cleanly when the industry is outside the curated set', () => {
    const tpl = getMoodById('hero')!
    const otherInput: BrandInput = { ...input, industry: 'Marine logistics' }
    const prompt = buildMoodPrompt(otherInput, result, tpl)
    expect(prompt).not.toContain('IDENTITY:')
    // Still contains the raw industry as fallback signal.
    expect(prompt).toContain('Marine logistics')
  })

  it('emits a different anchor for a food brand', () => {
    const tpl = getMoodById('lifestyle')!
    const foodInput: BrandInput = { ...input, industry: 'Bakery & Cafe' }
    const prompt = buildMoodPrompt(foodInput, result, tpl)
    expect(prompt).toContain('FOOD & BEVERAGE IDENTITY')
  })
})

describe('pickMoodStyle (unchanged behavior, regression guard)', () => {
  it('returns vector_illustration for vector/geometric briefs', () => {
    expect(pickMoodStyle('vector flat geometric')).toBe('vector_illustration')
    expect(pickMoodStyle('clean minimal monoline iconography')).toBe('vector_illustration')
  })
  it('returns digital_illustration for illustrated briefs', () => {
    expect(pickMoodStyle('hand-drawn whimsical illustration')).toBe('digital_illustration')
  })
  it('defaults to realistic_image', () => {
    expect(pickMoodStyle('Restrained editorial luxury')).toBe('realistic_image')
  })
})
