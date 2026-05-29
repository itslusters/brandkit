// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'u_test' }),
}))

vi.mock('@/lib/tier', async () => {
  const actual = await vi.importActual<typeof import('@/lib/tier')>('@/lib/tier')
  return { ...actual, getUserTier: vi.fn().mockResolvedValue('essentials'), requireTier: vi.fn().mockResolvedValue({ ok: true }) }
})

const mockLimit = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/lib/ratelimit', () => ({
  getLogoLimiter: () => ({ limit: mockLimit }),
  getBriefLimiter: () => ({ limit: vi.fn().mockResolvedValue({ success: true }) }),
  briefLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  logoLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  emailLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getIp: () => '127.0.0.1',
}))

vi.mock('@/lib/pdf', () => ({
  buildBrandGuidePDF: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
}))

import { auth } from '@clerk/nextjs/server'
import { POST } from '@/app/api/brand/guide/generate/route'
import type { BrandResult } from '@/lib/types'

const mockBrandResult: BrandResult = {
  industry: 'SaaS archetype',
  namingCandidates: [{ name: 'Nexio', rationale: 'test' }],
  styleBrief: {
    recommendedStyle: 'Geometric Minimal',
    colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
    typography: ['Inter', 'Playfair'],
    avoidList: [],
    recommendedMockups: ['business-card'],
  },
}

function makeRequest() {
  return new Request('http://test', {
    method: 'POST',
    body: JSON.stringify({
      brandName: 'TestBrand',
      brandResult: mockBrandResult,
      selectedLogoDataUrl: 'data:image/png;base64,aGVsbG8=',
    }),
  })
}

describe('POST /api/brand/guide/generate', () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({ userId: 'u_test' } as any)
    mockLimit.mockResolvedValue({ success: true })
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 429 when rate limiter returns success: false', async () => {
    mockLimit.mockResolvedValue({ success: false })
    // NODE_ENV must not be 'development' for the rate limit check to run
    const origEnv = process.env.NODE_ENV
    // @ts-expect-error overriding read-only property for test
    process.env.NODE_ENV = 'production'
    try {
      const res = await POST(makeRequest())
      expect(res.status).toBe(429)
      const body = await res.json()
      expect(body.error).toBe('rate_limited')
    } finally {
      // @ts-expect-error restoring
      process.env.NODE_ENV = origEnv
    }
  })

  it('returns a PDF response on success', async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
  })

  it('returns 400 for invalid logo data URL', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({
        brandName: 'TestBrand',
        brandResult: mockBrandResult,
        selectedLogoDataUrl: 'not-a-data-url',
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
