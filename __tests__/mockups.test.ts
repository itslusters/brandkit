// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { MOCKUP_TEMPLATES, getTemplateById, composeMockup } from '@/lib/mockups'
import sharp from 'sharp'

describe('MOCKUP_TEMPLATES', () => {
  it('has exactly 9 templates', () => {
    expect(MOCKUP_TEMPLATES).toHaveLength(9)
  })

  it('each template has unique id', () => {
    const ids = MOCKUP_TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(9)
  })

  it('each template has a positive logoZone', () => {
    for (const t of MOCKUP_TEMPLATES) {
      expect(t.logoZone.width).toBeGreaterThan(0)
      expect(t.logoZone.height).toBeGreaterThan(0)
    }
  })
})

describe('getTemplateById', () => {
  it('returns template when found', () => {
    expect(getTemplateById('business-card')?.id).toBe('business-card')
  })
  it('returns undefined when not found', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined()
  })
})

describe('composeMockup', () => {
  it('produces a valid PNG when given a logo buffer + template', async () => {
    const template = await sharp({
      create: { width: 400, height: 400, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    }).png().toBuffer()

    const logo = await sharp({
      create: { width: 100, height: 100, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } },
    }).png().toBuffer()

    const zone = { x: 50, y: 50, width: 200, height: 200 }
    const result = await composeMockup(template, logo, zone)

    expect(result.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]))

    const meta = await sharp(result).metadata()
    expect(meta.width).toBe(400)
    expect(meta.height).toBe(400)
  })
})
