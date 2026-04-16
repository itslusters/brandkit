// @vitest-environment node
import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { pngToSvg } from '@/lib/vector'

describe('pngToSvg', () => {
  it('returns a valid SVG string for a simple PNG', async () => {
    const innerSquare = await sharp({
      create: { width: 40, height: 40, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    }).png().toBuffer()

    const png = await sharp({
      create: { width: 80, height: 80, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite([{ input: innerSquare, left: 20, top: 20 }])
      .png()
      .toBuffer()

    const svg = await pngToSvg(png)
    expect(svg).toMatch(/^<svg/)
    expect(svg).toContain('</svg>')
    expect(svg).toMatch(/<path[^>]+d="/)
  })
})
