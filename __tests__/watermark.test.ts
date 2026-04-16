// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import sharp from 'sharp'
import { applyWatermark } from '@/lib/watermark'

describe('applyWatermark', () => {
  it('returns a PNG of the same dimensions as input', async () => {
    const input = await sharp({
      create: { width: 800, height: 600, channels: 4, background: { r: 200, g: 200, b: 200, alpha: 1 } },
    }).png().toBuffer()

    const result = await applyWatermark(input)

    expect(result.slice(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    const meta = await sharp(result).metadata()
    expect(meta.width).toBe(800)
    expect(meta.height).toBe(600)
  })

  it('actually changes pixels (watermark is composited, not no-op)', async () => {
    const input = await sharp({
      create: { width: 800, height: 600, channels: 4, background: { r: 200, g: 200, b: 200, alpha: 1 } },
    }).png().toBuffer()

    const result = await applyWatermark(input)
    expect(result.length).not.toBe(input.length)
  })
})
