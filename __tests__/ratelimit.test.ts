// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Upstash before importing our module
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      // stub methods used internally by Ratelimit
    }),
  },
}))

const limitMock = vi.fn()
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static fixedWindow() { return {} }
    limit = limitMock
  },
}))

describe('ratelimit', () => {
  beforeEach(() => { limitMock.mockReset() })

  it('exports briefLimiter, logoLimiter, emailLimiter', async () => {
    const mod = await import('@/lib/ratelimit')
    expect(mod.briefLimiter).toBeDefined()
    expect(mod.logoLimiter).toBeDefined()
    expect(mod.emailLimiter).toBeDefined()
  })

  it('getIp extracts from x-forwarded-for, falls back to unknown', async () => {
    const { getIp } = await import('@/lib/ratelimit')
    const req1 = new Request('http://x', { headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })
    expect(getIp(req1)).toBe('1.2.3.4')
    const req2 = new Request('http://x')
    expect(getIp(req2)).toBe('unknown')
  })
})
