// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('server-only', () => ({}))

const { store } = vi.hoisted(() => ({ store: new Map<string, unknown>() }))
vi.mock('@upstash/redis', () => {
  class MockRedis {
    static fromEnv() { return new MockRedis() }
    async get(k: string) { return store.get(k) ?? null }
    async set(k: string, v: unknown) { store.set(k, v) }
  }
  return { Redis: MockRedis }
})

import {
  getAnonTier,
  grantAnonOnetime,
  grantAnonSubscription,
  revokeAnonSubscription,
} from '@/lib/anon-entitlement'

describe('anon-entitlement (Upstash-keyed mirror of Clerk entitlements)', () => {
  beforeEach(() => store.clear())

  it('defaults to free for an unknown id', async () => {
    expect(await getAnonTier('dev-1')).toBe('free')
  })

  it('grants a one-time tier', async () => {
    expect(await grantAnonOnetime('dev-1', 'essentials')).toBe('essentials')
    expect(await getAnonTier('dev-1')).toBe('essentials')
  })

  it('never downgrades a higher one-time tier (replayed lower grant is a no-op)', async () => {
    await grantAnonOnetime('dev-1', 'pro')
    expect(await grantAnonOnetime('dev-1', 'essentials')).toBe('pro')
    expect(await getAnonTier('dev-1')).toBe('pro')
  })

  it('folds one-time + subscription to the higher rank', async () => {
    await grantAnonOnetime('dev-1', 'pro')         // rank 2
    await grantAnonSubscription('dev-1', 'solo')   // rank 1 — does not erase pro
    expect(await getAnonTier('dev-1')).toBe('pro')
  })

  it('revoking the subscription falls back to the one-time bucket', async () => {
    await grantAnonOnetime('dev-1', 'essentials')
    await grantAnonSubscription('dev-1', 'studio') // rank 3
    expect(await getAnonTier('dev-1')).toBe('studio')
    expect(await revokeAnonSubscription('dev-1')).toBe('essentials')
  })
})
