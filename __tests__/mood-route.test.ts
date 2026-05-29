// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

// vi.hoisted ensures mockMoodLimit is available inside vi.mock factories,
// which are hoisted to the top of the file before other variable declarations.
const { mockMoodLimit } = vi.hoisted(() => ({
  mockMoodLimit: vi.fn().mockResolvedValue({ success: true }),
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
  getMoodLimiter: () => ({ limit: mockMoodLimit }),
  getLogoLimiter: () => ({ limit: vi.fn().mockResolvedValue({ success: true }) }),
  briefLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  moodLimiter: { limit: mockMoodLimit },
  logoLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  emailLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getIp: () => '127.0.0.1',
}))

vi.mock('@/lib/imagen', () => ({
  generateImagenImage: vi.fn(),
}))

vi.mock('@/lib/mood-templates', () => ({
  MOOD_TEMPLATES: [
    { id: 'mood-1', size: '1024x1024' },
    { id: 'mood-2', size: '1024x1024' },
  ],
  MOOD_FREE_COUNT: 1,
  buildMoodPrompt: vi.fn(() => 'mock mood prompt'),
  getMoodById: vi.fn((id: string) => ({ id, size: '1024x1024' })),
  moodAspect: vi.fn(() => '1:1'),
}))

import { auth } from '@clerk/nextjs/server'
import { generateImagenImage } from '@/lib/imagen'
import { POST } from '@/app/api/brand/mood/generate/route'
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

function makeRequest(extra?: Record<string, unknown>) {
  return new Request('http://test', {
    method: 'POST',
    body: JSON.stringify({ brandInput: mockInput, brandResult: mockBrandResult, ...extra }),
  })
}

describe('POST /api/brand/mood/generate', () => {
  beforeEach(() => {
    // Reset to signed-in default
    vi.mocked(auth).mockResolvedValue({ userId: 'u_test', sessionClaims: { publicMetadata: { tier: 'free' } } } as any)
    mockMoodLimit.mockResolvedValue({ success: true })
    vi.mocked(generateImagenImage).mockResolvedValue(Buffer.from('mockimage'))
  })

  it('returns SSE content-type header', async () => {
    const res = await POST(makeRequest())
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')
  })

  it('emits a plan event', async () => {
    const res = await POST(makeRequest())
    const events = await collectSSE(res)
    const planEvent = events.find((e: any) => e.type === 'plan') as any
    expect(planEvent).toBeDefined()
  })

  it('emits done event', async () => {
    const res = await POST(makeRequest())
    const events = await collectSSE(res)
    expect(events.find((e: any) => e.type === 'done')).toBeDefined()
  })

  it('allows an anonymous request (no userId) and keys the mood limiter by anon id', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    try {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)
      mockMoodLimit.mockResolvedValue({ success: true })
      mockMoodLimit.mockClear()

      const res = await POST(new Request('https://x.test/api/brand/mood/generate', {
        method: 'POST',
        headers: { 'x-anon-id': 'dev-XYZ' },
        body: JSON.stringify({ brandInput: mockInput, brandResult: mockBrandResult }),
      }))
      expect(res.status).toBe(200)
      expect(mockMoodLimit).toHaveBeenCalledWith('anon:dev-XYZ')
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('rate-limits an anonymous request that is over the cap', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    try {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)
      mockMoodLimit.mockResolvedValue({ success: false })

      const res = await POST(new Request('https://x.test/api/brand/mood/generate', {
        method: 'POST',
        headers: { 'x-anon-id': 'dev-XYZ' },
        body: JSON.stringify({ brandInput: mockInput, brandResult: mockBrandResult }),
      }))
      expect(res.status).toBe(429)
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
