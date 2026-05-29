// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('server-only', () => ({}))

const { generateImagenImage } = vi.hoisted(() => ({ generateImagenImage: vi.fn() }))
vi.mock('@/lib/imagen', () => ({ generateImagenImage }))

import { generateMockup, isMockupId } from '@/lib/mockups-imagen'
import type { BrandResult } from '@/lib/types'

const brandResult: BrandResult = {
  industry: 'SaaS B2B archetype',
  namingCandidates: [],
  styleBrief: {
    recommendedStyle: 'Geometric Minimal',
    colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
    typography: ['Inter'],
    avoidList: [],
    recommendedMockups: ['business-card'],
  } as BrandResult['styleBrief'],
}

describe('generateMockup (Imagen)', () => {
  beforeEach(() => {
    generateImagenImage.mockReset()
    generateImagenImage.mockResolvedValue(Buffer.from('mock-png'))
  })

  it('calls Imagen with a prompt carrying the brand name', async () => {
    await generateMockup('business-card', 'Acme', brandResult, { industry: 'SaaS B2B' } as never)
    expect(generateImagenImage).toHaveBeenCalledTimes(1)
    const [prompt, opts] = generateImagenImage.mock.calls[0]
    expect(prompt).toContain('Acme')
    expect(opts).toEqual({ aspectRatio: '1:1' })
  })

  it('strips the leak-prone "IDENTITY:" anchor label from the prompt', async () => {
    await generateMockup('mug', 'Acme', brandResult, { industry: 'SaaS B2B' } as never)
    const [prompt] = generateImagenImage.mock.calls[0]
    expect(prompt).not.toContain('IDENTITY:')
    // descriptive category character still present
    expect(prompt.toLowerCase()).toMatch(/geometric|monoline/)
  })

  it('returns the generated buffer', async () => {
    const out = await generateMockup('app-icon', 'Acme', brandResult)
    expect(out.toString()).toBe('mock-png')
  })

  it('throws on an unknown template id', async () => {
    await expect(generateMockup('spaceship', 'Acme', brandResult)).rejects.toThrow('Unknown mockup template')
  })

  it('isMockupId guards valid ids', () => {
    expect(isMockupId('business-card')).toBe(true)
    expect(isMockupId('spaceship')).toBe(false)
  })
})
