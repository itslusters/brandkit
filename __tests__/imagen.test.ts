// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('server-only', () => ({}))

const { generateImages } = vi.hoisted(() => ({ generateImages: vi.fn() }))
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateImages }
  },
}))

import { generateImagenImage } from '@/lib/imagen'

describe('generateImagenImage', () => {
  beforeEach(() => {
    generateImages.mockReset()
    process.env.GEMINI_API_KEY = 'test-key'
  })

  it('returns a Buffer decoded from imageBytes', async () => {
    const png = Buffer.from('hello-png')
    generateImages.mockResolvedValue({
      generatedImages: [{ image: { imageBytes: png.toString('base64') } }],
    })
    const out = await generateImagenImage('a logo', { aspectRatio: '1:1' })
    expect(Buffer.isBuffer(out)).toBe(true)
    expect(out.toString()).toBe('hello-png')
    expect(generateImages).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'imagen-4.0-fast-generate-001', prompt: 'a logo' }),
    )
  })

  it('falls back to the next model tier when one is saturated', async () => {
    const png = Buffer.from('fallback-png')
    // fast tier exhausts its 3 retries with capacity 503s...
    generateImages
      .mockRejectedValueOnce(new Error('{"error":{"code":503,"status":"UNAVAILABLE"}}'))
      .mockRejectedValueOnce(new Error('{"error":{"code":503,"status":"UNAVAILABLE"}}'))
      .mockRejectedValueOnce(new Error('{"error":{"code":503,"status":"UNAVAILABLE"}}'))
      // ...then the standard tier succeeds.
      .mockResolvedValueOnce({
        generatedImages: [{ image: { imageBytes: png.toString('base64') } }],
      })
    const out = await generateImagenImage('a logo')
    expect(out.toString()).toBe('fallback-png')
    expect(generateImages).toHaveBeenCalledTimes(4)
    expect(generateImages).toHaveBeenLastCalledWith(
      expect.objectContaining({ model: 'imagen-4.0-generate-001' }),
    )
  })

  it('does not fall through the chain on a non-transient error', async () => {
    generateImages.mockRejectedValue(new Error('400 invalid prompt'))
    await expect(generateImagenImage('x')).rejects.toThrow('invalid prompt')
    expect(generateImages).toHaveBeenCalledTimes(1) // no retry, no fallback
  })

  it('throws when the API returns no image', async () => {
    generateImages.mockResolvedValue({ generatedImages: [] })
    await expect(generateImagenImage('x')).rejects.toThrow('no image')
  })

  it('throws when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY
    await expect(generateImagenImage('x')).rejects.toThrow('GEMINI_API_KEY')
  })
})
