// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('server-only', () => ({}))

const m = vi.hoisted(() => ({
  grantOnetimeTier: vi.fn(), grantSubscriptionTier: vi.fn(), revokeSubscriptionTier: vi.fn(),
  grantAnonOnetime: vi.fn(), grantAnonSubscription: vi.fn(), revokeAnonSubscription: vi.fn(),
}))
vi.mock('@/lib/entitlements', () => ({
  grantOnetimeTier: m.grantOnetimeTier,
  grantSubscriptionTier: m.grantSubscriptionTier,
  revokeSubscriptionTier: m.revokeSubscriptionTier,
}))
vi.mock('@/lib/anon-entitlement', () => ({
  grantAnonOnetime: m.grantAnonOnetime,
  grantAnonSubscription: m.grantAnonSubscription,
  revokeAnonSubscription: m.revokeAnonSubscription,
}))

import { POST } from '@/app/api/revenuecat/webhook/route'

const SECRET = 'test-secret'

function post(event: object) {
  return POST(new Request('https://x.test/api/revenuecat/webhook', {
    method: 'POST',
    headers: { authorization: `Bearer ${SECRET}`, 'content-type': 'application/json' },
    body: JSON.stringify({ event }),
  }))
}

describe('revenuecat webhook — entitlement routing by id shape', () => {
  beforeEach(() => {
    Object.values(m).forEach((fn) => fn.mockReset())
    process.env.REVENUECAT_WEBHOOK_SECRET = SECRET
  })

  it('routes a Clerk userId (user_*) one-time purchase to the Clerk store', async () => {
    const res = await post({ type: 'NON_RENEWING_PURCHASE', app_user_id: 'user_abc', entitlement_ids: ['pro'] })
    expect(res.status).toBe(200)
    expect(m.grantOnetimeTier).toHaveBeenCalledWith('user_abc', 'pro')
    expect(m.grantAnonOnetime).not.toHaveBeenCalled()
  })

  it('routes an anonymous id one-time purchase to the anon store', async () => {
    const res = await post({ type: 'NON_RENEWING_PURCHASE', app_user_id: 'dev-xyz', entitlement_ids: ['essentials'] })
    expect(res.status).toBe(200)
    expect(m.grantAnonOnetime).toHaveBeenCalledWith('dev-xyz', 'essentials')
    expect(m.grantOnetimeTier).not.toHaveBeenCalled()
  })

  it('routes an anonymous subscription grant + expiration to the anon store', async () => {
    await post({ type: 'INITIAL_PURCHASE', app_user_id: 'dev-xyz', entitlement_ids: ['solo'] })
    expect(m.grantAnonSubscription).toHaveBeenCalledWith('dev-xyz', 'solo')
    await post({ type: 'EXPIRATION', app_user_id: 'dev-xyz' })
    expect(m.revokeAnonSubscription).toHaveBeenCalledWith('dev-xyz')
    expect(m.revokeSubscriptionTier).not.toHaveBeenCalled()
  })

  it('rejects an unauthenticated request', async () => {
    const res = await POST(new Request('https://x.test/api/revenuecat/webhook', {
      method: 'POST', headers: { authorization: 'Bearer wrong' }, body: JSON.stringify({ event: {} }),
    }))
    expect(res.status).toBe(401)
  })
})
