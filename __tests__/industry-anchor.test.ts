// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { industryAnchor, industryMockupSurface } from '@/lib/industry-anchor'

describe('industryAnchor', () => {
  it('returns a tech anchor for SaaS-family inputs', () => {
    expect(industryAnchor('SaaS B2B')).toContain('TECH-PRODUCT IDENTITY')
    expect(industryAnchor('AI platform')).toContain('TECH-PRODUCT IDENTITY')
    expect(industryAnchor('Developer tooling')).toContain('TECH-PRODUCT IDENTITY')
  })

  it('returns food anchor for food inputs', () => {
    expect(industryAnchor('Bakery & Cafe')).toContain('FOOD & BEVERAGE IDENTITY')
    expect(industryAnchor('Restaurant')).toContain('FOOD & BEVERAGE IDENTITY')
  })

  it('returns wellness anchor for wellness inputs', () => {
    expect(industryAnchor('Yoga studio')).toContain('WELLNESS IDENTITY')
    expect(industryAnchor('Skincare')).toContain('WELLNESS IDENTITY')
  })

  it('returns finance anchor for finance inputs', () => {
    expect(industryAnchor('Investment bank')).toContain('FINANCE IDENTITY')
  })

  it('returns fashion anchor for fashion inputs', () => {
    expect(industryAnchor('Beauty cosmetic brand')).toContain('FASHION IDENTITY')
  })

  it('returns publishing anchor for publishing inputs', () => {
    expect(industryAnchor('Literary newsletter')).toContain('PUBLISHING IDENTITY')
  })

  it('returns education anchor for education inputs', () => {
    expect(industryAnchor('Online learning academy')).toContain('EDUCATION IDENTITY')
  })

  it('returns property anchor for real estate / architecture inputs', () => {
    expect(industryAnchor('Architecture firm')).toContain('PROPERTY / ARCHITECTURE IDENTITY')
  })

  it('returns empty string for unmatched industries', () => {
    expect(industryAnchor('Marine logistics')).toBe('')
    expect(industryAnchor('')).toBe('')
  })

  it('SaaS anchor explicitly bans the failure modes seen in dogfood', () => {
    const a = industryAnchor('SaaS')
    expect(a).toContain('No serifs')
    expect(a).toContain('no magazine framing')
    expect(a).toContain('no human figures')
  })
})

describe('industryMockupSurface', () => {
  it('returns a tech surface for SaaS', () => {
    const s = industryMockupSurface('SaaS B2B')
    expect(s).toMatch(/tech studio|concrete|brushed metal/i)
  })

  it('returns a food surface for bakeries', () => {
    const s = industryMockupSurface('Bakery & Cafe')
    expect(s).toMatch(/wooden|linen|botanical/i)
  })

  it('returns empty for unmatched industries so callers keep the default prop', () => {
    expect(industryMockupSurface('Marine logistics')).toBe('')
  })
})
