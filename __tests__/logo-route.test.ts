// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

// vi.hoisted ensures mockLogoLimit is available inside vi.mock factories,
// which are hoisted to the top of the file before other variable declarations.
const { mockLogoLimit } = vi.hoisted(() => ({
  mockLogoLimit: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'u_test', sessionClaims: { publicMetadata: { tier: 'free' } } }),
}))

vi.mock('@/lib/tier', async () => {
  const actual = await vi.importActual<typeof import('@/lib/tier')>('@/lib/tier')
  return { ...actual, getUserTier: vi.fn().mockResolvedValue('free') }
})

vi.mock('@/lib/ratelimit', () => ({
  getBriefLimiter: () => ({ limit: vi.fn().mockResolvedValue({ success: true }) }),
  getLogoLimiter: () => ({ limit: mockLogoLimit }),
  briefLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  logoLimiter: { limit: mockLogoLimit },
  emailLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getIp: () => '127.0.0.1',
}))

vi.mock('@/lib/gemini', () => ({
  buildLogoPrompt: vi.fn(() => 'mock logo prompt'),
  ITERATION_MODIFIERS: { bolder: 'x', minimal: 'x', geometric: 'x', organic: 'x', playful: 'x' },
}))

vi.mock('@/lib/imagen', () => ({
  generateImagenImage: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { generateImagenImage } from '@/lib/imagen'
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
    recommendedMockups: ['business-card', 'app-icon', 'social-post'],
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
      logoType: 'symbol-text',
    }),
  })
}

describe('POST /api/brand/logo/generate', () => {
  beforeEach(() => {
    // Reset to signed-in default
    vi.mocked(auth).mockResolvedValue({ userId: 'u_test', sessionClaims: { publicMetadata: { tier: 'free' } } } as any)
    mockLogoLimit.mockResolvedValue({ success: true })
    vi.mocked(generateImagenImage).mockResolvedValue(Buffer.from('mockimage'))
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

  it('emits image_error per failed image (others still proceed)', async () => {
    vi.mocked(generateImagenImage).mockRejectedValue(new Error('Imagen failed'))
    const res = await POST(makeRequest())
    const events = await collectSSE(res)
    const imageErrors = events.filter((e: any) => e.type === 'image_error')
    expect(imageErrors).toHaveLength(3)
    expect((imageErrors[0] as any).message).toContain('Imagen failed')
    // done event still fires after all 3 settle
    expect(events.find((e: any) => e.type === 'done')).toBeDefined()
  })

  it('allows an anonymous request (no userId) and keys the logo limiter by anon id', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    try {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)
      mockLogoLimit.mockResolvedValue({ success: true })
      mockLogoLimit.mockClear()

      const res = await POST(new Request('https://x.test/api/brand/logo/generate', {
        method: 'POST',
        headers: { 'x-anon-id': 'dev-XYZ' },
        body: JSON.stringify({
          brandInput: mockInput,
          brandResult: mockBrandResult,
          selectedName: 'Nexio',
          logoType: 'symbol-text',
        }),
      }))
      expect(res.status).toBe(200)
      expect(mockLogoLimit).toHaveBeenCalledWith('anon:dev-XYZ')
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('rate-limits an anonymous request that is over the cap', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    try {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)
      mockLogoLimit.mockResolvedValue({ success: false })

      const res = await POST(new Request('https://x.test/api/brand/logo/generate', {
        method: 'POST',
        headers: { 'x-anon-id': 'dev-XYZ' },
        body: JSON.stringify({
          brandInput: mockInput,
          brandResult: mockBrandResult,
          selectedName: 'Nexio',
          logoType: 'symbol-text',
        }),
      }))
      expect(res.status).toBe(429)
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
