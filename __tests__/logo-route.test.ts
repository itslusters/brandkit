// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/gemini', () => ({
  genai: {
    models: {
      generateImages: vi.fn(),
    },
  },
  buildLogoPrompt: vi.fn(() => 'mock logo prompt'),
}))

import { genai } from '@/lib/gemini'
import { POST } from '@/app/api/brand/logo/generate/route'
import type { BrandInput, BrandResult } from '@/lib/types'

const mockInput: BrandInput = {
  companyName: 'TestCo',
  industry: 'SaaS',
  targetCustomer: 'Founders',
  tones: ['minimal', 'trusted', 'bold'],
  competitor: '',
}

const mockBrandResult: BrandResult = {
  industry: 'SaaS archetype',
  namingCandidates: [{ name: 'Nexio', rationale: '테스트' }],
  styleBrief: {
    recommendedStyle: 'Geometric Minimal',
    colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
    typography: ['Inter', 'Playfair'],
    avoidList: ['그라디언트'],
    moodImages: ['minimal-tech-1'],
  },
}

async function collectSSE(res: Response): Promise<object[]> {
  const text = await res.text()
  return text
    .split('\n\n')
    .filter(msg => msg.startsWith('data: '))
    .map(msg => JSON.parse(msg.slice(6)))
}

function makeRequest() {
  return new Request('http://test', {
    method: 'POST',
    body: JSON.stringify({
      brandInput: mockInput,
      brandResult: mockBrandResult,
      selectedName: 'Nexio',
      logoType: 'wordmark',
    }),
  })
}

describe('POST /api/brand/logo/generate', () => {
  beforeEach(() => {
    vi.mocked(genai.models.generateImages).mockResolvedValue({
      generatedImages: [{ image: { imageBytes: 'bW9ja2ltYWdl' } }],
    } as any)
  })

  it('returns SSE content-type header', async () => {
    const res = await POST(makeRequest())
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')
  })

  it('emits 3 image_ready events', async () => {
    const res = await POST(makeRequest())
    const events = await collectSSE(res)
    const imageEvents = events.filter((e: any) => e.type === 'image_ready')
    expect(imageEvents).toHaveLength(3)
  })

  it('image_ready events include index and dataUrl', async () => {
    const res = await POST(makeRequest())
    const events = await collectSSE(res)
    const imageEvent = events.find((e: any) => e.type === 'image_ready') as any
    expect(imageEvent).toHaveProperty('index')
    expect(imageEvent.dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('emits done event after all images', async () => {
    const res = await POST(makeRequest())
    const events = await collectSSE(res)
    const doneEvent = events.find((e: any) => e.type === 'done')
    expect(doneEvent).toBeDefined()
  })

  it('emits error event when Gemini API throws', async () => {
    vi.mocked(genai.models.generateImages).mockRejectedValue(new Error('Imagen failed'))
    const res = await POST(makeRequest())
    const events = await collectSSE(res)
    const errorEvent = events.find((e: any) => e.type === 'error') as any
    expect(errorEvent).toBeDefined()
    expect(errorEvent.message).toContain('Imagen failed')
  })
})
