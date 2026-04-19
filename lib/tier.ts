import { auth } from '@clerk/nextjs/server'

export type UserTier = 'free' | 'essentials' | 'solo' | 'pro' | 'studio'
export type OnetimeTier = 'essentials' | 'pro'
export type SubscriptionTier = 'solo' | 'studio'
export type PaidPlan = OnetimeTier | SubscriptionTier

const VALID: UserTier[] = ['free', 'essentials', 'solo', 'pro', 'studio']
const ONETIME: OnetimeTier[] = ['essentials', 'pro']
const SUBSCRIPTION: SubscriptionTier[] = ['solo', 'studio']

/**
 * Feature-unlock ranks. essentials (one-time) and solo (monthly) unlock the
 * same baseline — clean PNG, SVG, PDF guide, asset ZIP. Pro (one-time) adds
 * a designer-polished logo. Studio (monthly) is a strict superset of pro,
 * layering recurring designer credit + custom style training on top.
 */
export const TIER_RANK: Record<UserTier, number> = {
  free: 0,
  essentials: 1,
  solo: 1,
  pro: 2,
  studio: 3,
}

export function isPaidPlan(x: string): x is PaidPlan {
  return x === 'essentials' || x === 'solo' || x === 'pro' || x === 'studio'
}

export function isOnetimeTier(x: string): x is OnetimeTier {
  return (ONETIME as string[]).includes(x)
}

export function isSubscriptionTier(x: string): x is SubscriptionTier {
  return (SUBSCRIPTION as string[]).includes(x)
}

/**
 * Picks the higher-rank tier. Used when folding one-time entitlements with an
 * active subscription: someone on Pro (one-time designer polish) who also
 * subscribes to Solo (monthly unlimited) is effectively Pro — Solo doesn't
 * outrank Pro, but it doesn't erase the Pro entitlement either.
 */
export function combineTiers(onetime: OnetimeTier | null, subscription: SubscriptionTier | null): UserTier {
  const a: UserTier = onetime ?? 'free'
  const b: UserTier = subscription ?? 'free'
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b
}

export async function getUserTier(): Promise<UserTier> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return 'free'
  const raw = (sessionClaims?.publicMetadata as { tier?: string } | undefined)?.tier
  return raw && (VALID as string[]).includes(raw) ? (raw as UserTier) : 'free'
}

export async function requireTier(min: UserTier): Promise<{ ok: true } | { ok: false; tier: UserTier }> {
  const tier = await getUserTier()
  return TIER_RANK[tier] >= TIER_RANK[min]
    ? { ok: true }
    : { ok: false, tier }
}
