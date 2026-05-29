// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('server-only', () => ({}))

const h = vi.hoisted(() => ({ auth: vi.fn(), getUserTier: vi.fn(), getAnonTier: vi.fn(), redisGet: vi.fn() }))
vi.mock('@clerk/nextjs/server', () => ({ auth: () => h.auth() }))
vi.mock('@/lib/tier', async (orig) => ({ ...(await orig<typeof import('@/lib/tier')>()), getUserTier: h.getUserTier }))
vi.mock('@/lib/anon-entitlement', () => ({ getAnonTier: h.getAnonTier }))
vi.mock('@upstash/redis', () => {
  class MockRedis { static fromEnv() { return new MockRedis() } async get(k: string) { return h.redisGet(k) } }
  return { Redis: MockRedis }
})

import { getEntitlement } from '@/lib/entitlement-check'

const reqWith = (headers: Record<string, string> = {}) =>
  new Request('https://x.test/api/entitlement', { headers })

describe('getEntitlement', () => {
  beforeEach(() => {
    h.auth.mockReset(); h.getUserTier.mockReset(); h.getAnonTier.mockReset(); h.redisGet.mockReset()
    h.redisGet.mockResolvedValue(null)
  })

  it('reads a signed-in user tier from Clerk and marks paid as unlocked', async () => {
    h.auth.mockResolvedValue({ userId: 'user_1' })
    h.getUserTier.mockResolvedValue('essentials')
    const e = await getEntitlement(reqWith())
    expect(e).toMatchObject({ tier: 'essentials', unlocked: true, source: 'clerk' })
    expect(h.getAnonTier).not.toHaveBeenCalled()
  })

  it('reads an anon tier from the anon store via x-anon-id', async () => {
    h.auth.mockResolvedValue({ userId: null })
    h.getAnonTier.mockResolvedValue('solo')
    const e = await getEntitlement(reqWith({ 'x-anon-id': 'dev-1' }))
    expect(h.getAnonTier).toHaveBeenCalledWith('dev-1')
    expect(e).toMatchObject({ tier: 'solo', unlocked: true, source: 'anon' })
  })

  it('free + no referral = locked', async () => {
    h.auth.mockResolvedValue({ userId: null })
    h.getAnonTier.mockResolvedValue('free')
    const e = await getEntitlement(reqWith({ 'x-anon-id': 'dev-1' }))
    expect(e).toMatchObject({ tier: 'free', unlocked: false })
  })

  it('free + referral unlock key set = unlocked', async () => {
    h.auth.mockResolvedValue({ userId: null })
    h.getAnonTier.mockResolvedValue('free')
    h.redisGet.mockImplementation(async (k: string) => (k === 'unlock:referral:dev-1' ? '1' : null))
    const e = await getEntitlement(reqWith({ 'x-anon-id': 'dev-1' }))
    expect(e.unlocked).toBe(true)
  })

  it('ignores a malformed x-anon-id (falls to free/locked)', async () => {
    h.auth.mockResolvedValue({ userId: null })
    const e = await getEntitlement(reqWith({ 'x-anon-id': 'bad id!!' }))
    expect(e).toMatchObject({ tier: 'free', unlocked: false })
    expect(h.getAnonTier).not.toHaveBeenCalled()
  })
})
