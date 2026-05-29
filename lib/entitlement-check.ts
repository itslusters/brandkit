import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { Redis } from '@upstash/redis'
import { getUserTier, TIER_RANK, type UserTier } from './tier'
import { getAnonTier } from './anon-entitlement'

/**
 * Server-side source of truth for "what is this requester entitled to" — used
 * by every paid-asset / download route before serving. Resolves the tier from
 * Clerk (signed-in) or the anon-entitlement store (friction-zero, keyed by the
 * x-anon-id header). `unlocked` = paid tier OR a referral unlock.
 *
 * Never gate paid bytes on client state alone — call getEntitlement(req) here.
 */

const redis = Redis.fromEnv()
const ANON_RE = /^[a-zA-Z0-9-]{1,64}$/

function readAnonId(req: Request): string | null {
  const v = req.headers.get('x-anon-id')?.trim()
  return v && ANON_RE.test(v) ? v : null
}

/** Referral unlock contract — subsystem D writes `unlock:referral:<id>`; here we only read it. */
async function referralUnlocked(id: string | null): Promise<boolean> {
  if (!id) return false
  return !!(await redis.get(`unlock:referral:${id}`))
}

export interface Entitlement {
  tier: UserTier
  unlocked: boolean
  source: 'clerk' | 'anon'
}

export async function getEntitlement(req: Request): Promise<Entitlement> {
  const { userId } = await auth()
  const anonId = userId ? null : readAnonId(req)
  const tier = userId ? await getUserTier() : anonId ? await getAnonTier(anonId) : 'free'
  const paid = TIER_RANK[tier] > 0
  const unlocked = paid || (await referralUnlocked(userId ?? anonId))
  return { tier, unlocked, source: userId ? 'clerk' : 'anon' }
}

export async function getEffectiveTier(req: Request): Promise<UserTier> {
  return (await getEntitlement(req)).tier
}

export async function isUnlocked(req: Request): Promise<boolean> {
  return (await getEntitlement(req)).unlocked
}
