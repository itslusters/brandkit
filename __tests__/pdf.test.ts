// @vitest-environment node
import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { buildBrandGuidePDF } from '@/lib/pdf'
import type { BrandResult } from '@/lib/types'

const result: BrandResult = {
  industry: 'SaaS B2B',
  namingCandidates: [],
  styleBrief: {
    recommendedStyle: 'Geometric Minimal',
    colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
    typography: ['Inter', 'Playfair Display'],
    avoidList: ['neon colors'],
    moodImages: ['minimal-tech-1'],
    recommendedMockups: ['business-card', 'app-icon', 'social-post'],
  },
}

describe('buildBrandGuidePDF', () => {
  it('returns a buffer starting with %PDF magic bytes', async () => {
    const logoBuffer = await sharp({
      create: { width: 200, height: 200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    }).png().toBuffer()

    const pdf = await buildBrandGuidePDF({
      brandName: 'Nexio',
      result,
      logoPng: logoBuffer,
      mockupPngs: [],
    })

    expect(pdf.length).toBeGreaterThan(500)
    expect(pdf.slice(0, 4).toString()).toBe('%PDF')
  })
})
