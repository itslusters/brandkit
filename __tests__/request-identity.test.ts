// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
const authMock = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({ auth: () => authMock() }))

import { resolveRequestIdentity } from '@/lib/request-identity'

function reqWith(headers: Record<string, string>): Request {
  return new Request('https://x.test/api/brand/stream', { method: 'POST', headers })
}

describe('resolveRequestIdentity', () => {
  beforeEach(() => authMock.mockReset())

  it('uses the Clerk userId when signed in', async () => {
    authMock.mockResolvedValue({ userId: 'user_123' })
    const { userId, rlKey } = await resolveRequestIdentity(reqWith({ 'x-anon-id': 'abc' }))
    expect(userId).toBe('user_123')
    expect(rlKey).toBe('user_123')
  })

  it('falls back to a valid x-anon-id when anonymous', async () => {
    authMock.mockResolvedValue({ userId: null })
    const { userId, rlKey } = await resolveRequestIdentity(reqWith({ 'x-anon-id': 'dev-AB12' }))
    expect(userId).toBeNull()
    expect(rlKey).toBe('anon:dev-AB12')
  })

  it('ignores a malformed x-anon-id and falls back to IP', async () => {
    authMock.mockResolvedValue({ userId: null })
    const { rlKey } = await resolveRequestIdentity(
      reqWith({ 'x-anon-id': 'bad id!!', 'x-forwarded-for': '9.9.9.9, 1.1.1.1' }),
    )
    expect(rlKey).toBe('ip:9.9.9.9')
  })
})
