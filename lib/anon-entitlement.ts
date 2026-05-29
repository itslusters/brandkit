import 'server-only'
import { Redis } from '@upstash/redis'
import {
  combineTiers,
  TIER_RANK,
  type OnetimeTier,
  type SubscriptionTier,
  type UserTier,
} from './tier'

/**
 * Anonymous entitlement store — the no-Clerk mirror of lib/entitlements.ts.
 *
 * Friction-zero buyers pay through RevenueCat without a Clerk account, so their
 * RevenueCat App User ID is our device anon id (see lib/anon.ts / lib/iap.ts).
 * The RevenueCat webhook records their entitlement here, keyed by that anon id,
 * using the same two-bucket model as the Clerk path:
 *   - onetime      — highest one-time tier ever purchased (never revoked)
 *   - subscription — current active subscription tier (wiped on expiration)
 * Effective tier = max-rank of the two (combineTiers).
 */

const redis = Redis.fromEnv()
const key = (id: string) => `ent:anon:${id}`

interface AnonEntitlement {
  onetime: OnetimeTier | null
  subscription: SubscriptionTier | null
}

async function read(id: string): Promise<AnonEntitlement> {
  const v = await redis.get<AnonEntitlement>(key(id))
  return { onetime: v?.onetime ?? null, subscription: v?.subscription ?? null }
}

async function write(
  id: string,
  updates: { onetime?: OnetimeTier | null; subscription?: SubscriptionTier | null },
): Promise<UserTier> {
  const cur = await read(id)
  const next: AnonEntitlement = {
    onetime: updates.onetime === undefined ? cur.onetime : updates.onetime,
    subscription: updates.subscription === undefined ? cur.subscription : updates.subscription,
  }
  await redis.set(key(id), next)
  return combineTiers(next.onetime, next.subscription)
}

export async function getAnonTier(id: string): Promise<UserTier> {
  const { onetime, subscription } = await read(id)
  return combineTiers(onetime, subscription)
}

/** Grant/raise the one-time tier. A replayed lower grant never stomps a higher one. */
export async function grantAnonOnetime(id: string, tier: OnetimeTier): Promise<UserTier> {
  const { onetime } = await read(id)
  if (onetime && TIER_RANK[onetime] >= TIER_RANK[tier]) return getAnonTier(id)
  return write(id, { onetime: tier })
}

/** Grant/raise the active subscription tier. Lower grants never downgrade a higher sub. */
export async function grantAnonSubscription(id: string, tier: SubscriptionTier): Promise<UserTier> {
  const { subscription } = await read(id)
  if (subscription && TIER_RANK[subscription] >= TIER_RANK[tier]) return getAnonTier(id)
  return write(id, { subscription: tier })
}

/** Clear the subscription slot — effective tier falls back to the one-time bucket (or free). */
export async function revokeAnonSubscription(id: string): Promise<UserTier> {
  return write(id, { subscription: null })
}
