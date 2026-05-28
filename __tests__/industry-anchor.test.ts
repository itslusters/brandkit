// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { industryAnchor, industryMockupSurface, industryRenderHint, industryTypefaceHint, pickLogoStyle } from '@/lib/industry-anchor'

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

  it('returns empty string for unmatched free-text industries', () => {
    expect(industryAnchor('Marine logistics')).toBe('')
    expect(industryAnchor('')).toBe('')
  })

  it('covers every curated dropdown industry with a non-empty anchor', () => {
    for (const ind of ['E-commerce / Retail', 'Travel & Hospitality', 'Agency / Consulting']) {
      expect(industryAnchor(ind), ind).not.toBe('')
    }
  })

  it('routes Finance & Fintech to FINANCE, not the generic TECH anchor', () => {
    expect(industryAnchor('Finance & Fintech')).toContain('FINANCE IDENTITY')
    expect(industryAnchor('fintech startup')).toContain('FINANCE IDENTITY')
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

  it('covers every curated dropdown industry with a non-empty surface', () => {
    for (const ind of ['E-commerce / Retail', 'Travel & Hospitality', 'Agency / Consulting']) {
      expect(industryMockupSurface(ind), ind).not.toBe('')
    }
  })
})

describe('industryTypefaceHint', () => {
  it('names geometric grotesks for tech brands so Recraft renders the right family', () => {
    const t = industryTypefaceHint('SaaS B2B')
    expect(t.toLowerCase()).toMatch(/inter|founders\s*grotesk|gt\s*america/i)
  })
  it('names humanist warmth for food brands', () => {
    const t = industryTypefaceHint('Bakery & Cafe')
    expect(t.toLowerCase()).toMatch(/söhne|tiempos|gt\s*walsheim/i)
  })
  it('names editorial serifs for publishing brands', () => {
    const t = industryTypefaceHint('Literary newsletter')
    expect(t.toLowerCase()).toMatch(/tiempos|source\s*serif|gt\s*sectra/i)
  })
  it('returns empty for unmatched industries', () => {
    expect(industryTypefaceHint('Marine logistics')).toBe('')
  })

  it('covers every curated dropdown industry with a non-empty typeface hint', () => {
    for (const ind of ['E-commerce / Retail', 'Travel & Hospitality', 'Agency / Consulting']) {
      expect(industryTypefaceHint(ind), ind).not.toBe('')
    }
  })
})

describe('industryRenderHint', () => {
  it('always returns a non-empty render directive that keeps logos flat vector on white', () => {
    for (const ind of ['SaaS / Software', 'Food & Beverage', 'Fashion & Apparel', 'Finance & Fintech',
      'E-commerce / Retail', 'Travel & Hospitality', 'Agency / Consulting', 'Other', 'Marine logistics', '']) {
      const r = industryRenderHint(ind)
      expect(r, ind).not.toBe('')
      expect(r.toLowerCase(), ind).toContain('white background')
    }
  })
  it('gives category-specific render character that differs across industries', () => {
    expect(industryRenderHint('SaaS / Software').toLowerCase()).toContain('geometric')
    expect(industryRenderHint('Food & Beverage').toLowerCase()).toMatch(/organic|warm/)
    expect(industryRenderHint('SaaS / Software')).not.toBe(industryRenderHint('Food & Beverage'))
  })
})

describe('pickLogoStyle', () => {
  it('defaults to vector_illustration', () => {
    expect(pickLogoStyle('Geometric minimal grotesk', 'wordmark')).toBe('vector_illustration')
    expect(pickLogoStyle('Restrained editorial', 'emblem')).toBe('vector_illustration')
  })
  it('routes illustrated / hand-drawn briefs to digital_illustration', () => {
    expect(pickLogoStyle('hand-drawn whimsical illustration', 'wordmark')).toBe('digital_illustration')
    expect(pickLogoStyle('artisan painted feel', 'wordmark')).toBe('digital_illustration')
    expect(pickLogoStyle('cartoon playful style', 'symbol-text')).toBe('digital_illustration')
  })
  it('routes symbol-text + iconic briefs to icon', () => {
    expect(pickLogoStyle('iconic abstract mark', 'symbol-text')).toBe('icon')
    expect(pickLogoStyle('monogram-based symbol', 'symbol-text')).toBe('icon')
  })
  it('does not route to icon for non-symbol-text types even when brief says symbol', () => {
    expect(pickLogoStyle('iconic abstract mark', 'wordmark')).toBe('vector_illustration')
    expect(pickLogoStyle('iconic abstract mark', 'emblem')).toBe('vector_illustration')
  })
})
