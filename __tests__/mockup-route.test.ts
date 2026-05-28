// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

// vi.hoisted ensures mockLogoLimit is available inside vi.mock factories,
// which are hoisted to the top of the file before other variable declarations.
const { mockLogoLimit } = vi.hoisted(() => ({
  mockLogoLimit: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'u_test', sessionClaims: { publicMetadata: { tier: 'essentials' } } }),
}))

vi.mock('@/lib/tier', async () => {
  const actual = await vi.importActual<typeof import('@/lib/tier')>('@/lib/tier')
  return { ...actual, getUserTier: vi.fn().mockResolvedValue('essentials'), requireTier: vi.fn().mockResolvedValue({ ok: true }) }
})

vi.mock('@/lib/ratelimit', () => ({
  getBriefLimiter: () => ({ limit: vi.fn().mockResolvedValue({ success: true }) }),
  getLogoLimiter: () => ({ limit: mockLogoLimit }),
  briefLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  logoLimiter: { limit: mockLogoLimit },
  emailLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getIp: () => '127.0.0.1',
}))

vi.mock('@/lib/mockups-recraft', () => ({
  generateRecraftMockup: vi.fn().mockResolvedValue(Buffer.from('mockimage')),
}))

vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://blob.test/mock.png' }),
}))

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'testbatch'),
}))

import { auth } from '@clerk/nextjs/server'
import { requireTier } from '@/lib/tier'
import { POST } from '@/app/api/brand/mockup/generate/route'
import type { BrandResult } from '@/lib/types'

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

function makeRequest(extra?: Record<string, unknown>) {
  return new Request('http://test', {
    method: 'POST',
    body: JSON.stringify({
      templateIds: ['business-card'],
      brandName: 'TestCo',
      brandResult: mockBrandResult,
      ...extra,
    }),
  })
}

describe('POST /api/brand/mockup/generate', () => {
  beforeEach(() => {
    // Reset to signed-in essentials user default
    vi.mocked(auth).mockResolvedValue({ userId: 'u_test', sessionClaims: { publicMetadata: { tier: 'essentials' } } } as any)
    vi.mocked(requireTier).mockResolvedValue({ ok: true })
    mockLogoLimit.mockResolvedValue({ success: true })
  })

  it('returns results for a valid essentials request', async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.results).toHaveLength(1)
    expect(json.results[0].templateId).toBe('business-card')
  })

  it('returns 400 when templateIds is empty', async () => {
    const res = await POST(makeRequest({ templateIds: [] }))
    expect(res.status).toBe(400)
  })

  it('anonymous request gets 403 (tier_required) — not 401', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any)
    vi.mocked(requireTier).mockResolvedValue({ ok: false, tier: 'free' })

    const res = await POST(new Request('https://x.test/api/brand/mockup/generate', {
      method: 'POST',
      headers: { 'x-anon-id': 'dev-XYZ' },
      body: JSON.stringify({
        templateIds: ['business-card'],
        brandName: 'TestCo',
        brandResult: mockBrandResult,
      }),
    }))
    // Anonymous free-tier users get 403 (tier gate), NOT 401 (auth gate)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toBe('tier_required')
  })

  it('rate-limits an anonymous request that is over the cap', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    try {
      vi.mocked(auth).mockResolvedValue({ userId: null } as any)
      // Keep tier gate open to reach rate limiter
      vi.mocked(requireTier).mockResolvedValue({ ok: true })
      mockLogoLimit.mockResolvedValue({ success: false })

      const res = await POST(new Request('https://x.test/api/brand/mockup/generate', {
        method: 'POST',
        headers: { 'x-anon-id': 'dev-XYZ' },
        body: JSON.stringify({
          templateIds: ['business-card'],
          brandName: 'TestCo',
          brandResult: mockBrandResult,
        }),
      }))
      expect(res.status).toBe(429)
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
