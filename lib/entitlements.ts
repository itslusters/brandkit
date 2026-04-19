import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import {
  combineTiers,
  TIER_RANK,
  type OnetimeTier,
  type SubscriptionTier,
  type UserTier,
} from './tier'

/**
 * Clerk `publicMetadata` stores entitlements in two durable buckets:
 *
 *   - `tier_onetime`     — highest one-time tier ever purchased. Never revoked.
 *   - `tier_subscription`— current active subscription tier. Wiped on expiration.
 *   - `tier`             — computed effective tier (= max-rank of the two).
 *                          Denormalized so `getUserTier()` can read straight
 *                          from cached session claims without needing a
 *                          Clerk API roundtrip.
 *
 * Keeping the two buckets separate is what lets a user hold Pro (one-time)
 * and also subscribe to Solo; if Solo later expires, they drop back to Pro
 * instead of losing their lifetime designer polish.
 */

interface EntitlementMetadata {
  tier?: UserTier
  tier_onetime?: OnetimeTier | null
  tier_subscription?: SubscriptionTier | null
}

async function readEntitlements(userId: string) {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const meta = (user.publicMetadata ?? {}) as EntitlementMetadata & Record<string, unknown>
  return {
    client,
    user,
    meta,
    onetime: meta.tier_onetime ?? null,
    subscription: meta.tier_subscription ?? null,
  }
}

async function writeEntitlements(
  userId: string,
  updates: { onetime?: OnetimeTier | null; subscription?: SubscriptionTier | null },
): Promise<UserTier> {
  const { client, meta, onetime: curOnetime, subscription: curSub } = await readEntitlements(userId)
  const nextOnetime = updates.onetime === undefined ? curOnetime : updates.onetime
  const nextSub = updates.subscription === undefined ? curSub : updates.subscription
  const effective = combineTiers(nextOnetime, nextSub)
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...meta,
      tier: effective,
      tier_onetime: nextOnetime,
      tier_subscription: nextSub,
    },
  })
  return effective
}

/**
 * Grant or upgrade the one-time tier. Only writes if `tier` strictly outranks
 * the current one-time bucket — a replayed `essentials` webhook never stomps
 * on an existing `pro` lifetime purchase.
 */
export async function grantOnetimeTier(userId: string, tier: OnetimeTier): Promise<UserTier> {
  const { onetime } = await readEntitlements(userId)
  if (onetime && TIER_RANK[onetime] >= TIER_RANK[tier]) {
    return combineTiers(onetime, (await readEntitlements(userId)).subscription)
  }
  return writeEntitlements(userId, { onetime: tier })
}

/**
 * Grant (or raise) the active subscription tier. Runs on INITIAL_PURCHASE,
 * RENEWAL, UNCANCELLATION, TRANSFER — anything that re-asserts the user is
 * entitled. Lower-ranked grants never downgrade an existing higher sub.
 */
export async function grantSubscriptionTier(userId: string, tier: SubscriptionTier): Promise<UserTier> {
  const { subscription } = await readEntitlements(userId)
  if (subscription && TIER_RANK[subscription] >= TIER_RANK[tier]) {
    const fresh = await readEntitlements(userId)
    return combineTiers(fresh.onetime, fresh.subscription)
  }
  return writeEntitlements(userId, { subscription: tier })
}

/**
 * Clear the subscription slot. Effective tier falls back to the one-time
 * bucket (or free). Called on EXPIRATION and SUBSCRIPTION_PAUSED.
 */
export async function revokeSubscriptionTier(userId: string): Promise<UserTier> {
  return writeEntitlements(userId, { subscription: null })
}

/**
 * Legacy helper kept for backward compat with the original IAP flow. Routes
 * non-consumable purchases to the one-time bucket, subscriptions to the
 * subscription bucket.
 */
export async function upgradeUserTier(userId: string, tier: OnetimeTier | SubscriptionTier): Promise<UserTier> {
  if (tier === 'solo' || tier === 'studio') return grantSubscriptionTier(userId, tier)
  return grantOnetimeTier(userId, tier)
}
