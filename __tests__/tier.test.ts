// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const authMock = vi.fn()
const currentUserMock = vi.fn()
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
  currentUser: () => currentUserMock(),
}))

describe('getUserTier', () => {
  beforeEach(() => {
    authMock.mockReset()
    currentUserMock.mockReset()
    currentUserMock.mockResolvedValue(null)
  })

  it('returns free when no userId', async () => {
    authMock.mockResolvedValue({ userId: null, sessionClaims: null })
    const { getUserTier } = await import('@/lib/tier')
    expect(await getUserTier()).toBe('free')
  })

  it('returns free when metadata missing', async () => {
    authMock.mockResolvedValue({ userId: 'u_1', sessionClaims: { publicMetadata: {} } })
    const { getUserTier } = await import('@/lib/tier')
    expect(await getUserTier()).toBe('free')
  })

  it('returns essentials when set', async () => {
    authMock.mockResolvedValue({ userId: 'u_1', sessionClaims: { publicMetadata: { tier: 'essentials' } } })
    const { getUserTier } = await import('@/lib/tier')
    expect(await getUserTier()).toBe('essentials')
  })

  it('returns pro when set', async () => {
    authMock.mockResolvedValue({ userId: 'u_1', sessionClaims: { publicMetadata: { tier: 'pro' } } })
    const { getUserTier } = await import('@/lib/tier')
    expect(await getUserTier()).toBe('pro')
  })

  it('falls back to free on bogus values', async () => {
    authMock.mockResolvedValue({ userId: 'u_1', sessionClaims: { publicMetadata: { tier: 'unicorn' } } })
    const { getUserTier } = await import('@/lib/tier')
    expect(await getUserTier()).toBe('free')
  })

  it('reads from currentUser() when session token lacks publicMetadata', async () => {
    authMock.mockResolvedValue({ userId: 'u_1', sessionClaims: {} })
    currentUserMock.mockResolvedValue({ publicMetadata: { tier: 'studio' } })
    const { getUserTier } = await import('@/lib/tier')
    expect(await getUserTier()).toBe('studio')
  })
})

describe('requireTier', () => {
  beforeEach(() => {
    authMock.mockReset()
    currentUserMock.mockReset()
    currentUserMock.mockResolvedValue(null)
  })

  it('ok=true when tier meets minimum', async () => {
    authMock.mockResolvedValue({ userId: 'u_1', sessionClaims: { publicMetadata: { tier: 'pro' } } })
    const { requireTier } = await import('@/lib/tier')
    expect(await requireTier('essentials')).toEqual({ ok: true })
  })

  it('ok=false when below minimum', async () => {
    authMock.mockResolvedValue({ userId: null, sessionClaims: null })
    const { requireTier } = await import('@/lib/tier')
    expect(await requireTier('essentials')).toEqual({ ok: false, tier: 'free' })
  })
})
