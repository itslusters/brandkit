// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures mockBriefLimit is available inside vi.mock factories,
// which are hoisted to the top of the file before other variable declarations.
const { mockBriefLimit } = vi.hoisted(() => ({
  mockBriefLimit: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'u_test', sessionClaims: { publicMetadata: { tier: 'free' } } }),
}))

vi.mock('@/lib/tier', async () => {
  const actual = await vi.importActual<typeof import('@/lib/tier')>('@/lib/tier')
  return { ...actual, getUserTier: vi.fn().mockResolvedValue('free') }
})

// Mock rate limiter so tests don't hit Upstash.
// mockBriefLimit is stable across calls so tests can assert on it.
vi.mock('@/lib/ratelimit', () => ({
  getBriefLimiter: () => ({ limit: mockBriefLimit }),
  getLogoLimiter: () => ({ limit: vi.fn().mockResolvedValue({ success: true }) }),
  briefLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  logoLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  emailLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getIp: () => '127.0.0.1',
}))

// Mock the entire lib/claude module
vi.mock('@/lib/claude', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
  buildBrandPrompt: vi.fn(() => 'mock prompt'),
  parseNamingCandidates: vi.fn(() => [
    { name: 'Nexio', rationale: '테스트 이름' },
  ]),
  parseStyleBrief: vi.fn(() => ({
    recommendedStyle: 'Minimal',
    colorPalette: ['#000', '#fff', '#f00'],
    typography: ['Inter', 'Playfair'],
    avoidList: ['그라디언트'],
    recommendedMockups: ['business-card', 'app-icon', 'social-post'],
  })),
}))

import { auth } from '@clerk/nextjs/server'
import { anthropic } from '@/lib/claude'
import { POST } from '@/app/api/brand/stream/route'
import type { BrandInput } from '@/lib/types'

const mockInput: BrandInput = {
  companyName: 'TestCo',
  industry: 'SaaS / Software',
  targetCustomer: 'Founders',
  tones: ['Bold', 'Minimal', 'Trusted'],
  competitor: '',
}

function makeAsyncIterator(lines: string[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const text of lines) {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text } }
      }
    },
  }
}

async function collectSSE(res: Response): Promise<object[]> {
  const text = await res.text()
  return text
    .split('\n\n')
    .filter(msg => msg.startsWith('data: '))
    .map(msg => JSON.parse(msg.slice(6)))
}

describe('POST /api/brand/stream', () => {
  beforeEach(() => {
    // Reset to signed-in default
    vi.mocked(auth).mockResolvedValue({ userId: 'u_test', sessionClaims: { publicMetadata: { tier: 'free' } } } as any)
    mockBriefLimit.mockResolvedValue({ success: true })
    vi.mocked(anthropic.messages.create).mockResolvedValue(
      makeAsyncIterator([
        '[INDUSTRY_START]\n',
        'SaaS B2B archetype\n',
        '[NAMING_START]\n',
        'Nexio|테스트 이름\n',
        '[BRIEF_START]\n',
        '{"recommendedStyle":"Minimal","colorPalette":["#000","#fff","#f00"],"typography":["Inter","Playfair"],"avoidList":["그라디언트"]}',
      ]) as any
    )
  })

  it('returns a Response with SSE content-type', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(mockInput),
    })
    const res = await POST(req)
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')
  })

  it('emits token events for industry section', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(mockInput),
    })
    const res = await POST(req)
    const events = await collectSSE(res)
    const tokenEvents = events.filter((e: any) => e.type === 'token' && e.section === 'industry')
    expect(tokenEvents.length).toBeGreaterThan(0)
  })

  it('emits done event with BrandResult', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(mockInput),
    })
    const res = await POST(req)
    const events = await collectSSE(res)
    const doneEvent = events.find((e: any) => e.type === 'done') as any
    expect(doneEvent).toBeDefined()
    expect(doneEvent.result).toHaveProperty('industry')
    expect(doneEvent.result).toHaveProperty('namingCandidates')
    expect(doneEvent.result).toHaveProperty('styleBrief')
  })

  it('emits error event when stream throws', async () => {
    vi.mocked(anthropic.messages.create).mockRejectedValue(new Error('API error'))
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(mockInput),
    })
    const res = await POST(req)
    const events = await collectSSE(res)
    const errorEvent = events.find((e: any) => e.type === 'error') as any
    expect(errorEvent).toBeDefined()
    expect(errorEvent.message).toContain('API error')
  })

  it('allows an anonymous request (no userId) and keys the limit by anon id', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    try {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)
      mockBriefLimit.mockResolvedValue({ success: true })
      mockBriefLimit.mockClear()

      const res = await POST(new Request('https://x.test/api/brand/stream', {
        method: 'POST',
        headers: { 'x-anon-id': 'dev-XYZ' },
        body: JSON.stringify({ brandName: 'Acme', industry: 'tech', tones: [] }),
      }))
      expect(res.status).toBe(200)
      expect(mockBriefLimit).toHaveBeenCalledWith('anon:dev-XYZ')
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it('rate-limits an anonymous request that is over the cap', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    try {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)
      mockBriefLimit.mockResolvedValue({ success: false })

      const res = await POST(new Request('https://x.test/api/brand/stream', {
        method: 'POST',
        headers: { 'x-anon-id': 'dev-XYZ' },
        body: JSON.stringify({ brandName: 'Acme', industry: 'tech', tones: [] }),
      }))
      expect(res.status).toBe(429)
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
