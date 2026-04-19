import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { UserTier } from './tier'

const redis = Redis.fromEnv()

/**
 * Public-facing, IP-scoped limits for unauthenticated surfaces.
 * (Waitlist, public brand fetch, email — none of these require a login.)
 */
export const emailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(1, '24 h'),
  prefix: 'rl:email',
  analytics: false,
})

export const waitlistLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, '24 h'),
  prefix: 'rl:waitlist',
  analytics: false,
})

export const publicBrandLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(60, '1 h'),
  prefix: 'rl:public-brand',
  analytics: false,
})

/* --- Authenticated, tier-aware limits for generation endpoints --------- */

// One 24h counter per (limiter, tier, userId). Changing this bumps the
// prefix and resets everyone's counter — useful when loosening limits.
const LOGO_PER_TIER: Record<UserTier, number> = {
  free: 30,
  essentials: 80,
  solo: 250,
  pro: 250,
  studio: 800,
}

const BRIEF_PER_TIER: Record<UserTier, number> = {
  free: 40,
  essentials: 120,
  solo: 300,
  pro: 300,
  studio: 1000,
}

const limiterCache = new Map<string, Ratelimit>()

function getOrCreate(prefix: string, max: number): Ratelimit {
  const key = `${prefix}:${max}`
  const cached = limiterCache.get(key)
  if (cached) return cached
  const inst = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(max, '24 h'),
    prefix,
    analytics: false,
  })
  limiterCache.set(key, inst)
  return inst
}

export function getLogoLimiter(tier: UserTier): Ratelimit {
  return getOrCreate(`rl:logo:v2:${tier}`, LOGO_PER_TIER[tier])
}

export function getBriefLimiter(tier: UserTier): Ratelimit {
  return getOrCreate(`rl:brief:v2:${tier}`, BRIEF_PER_TIER[tier])
}

/* --- Legacy named exports — kept so test mocks and any remaining callers
       continue to compile. Both use free-tier limits; switch to the
       tier-aware getters above in new code.                           --- */
export const logoLimiter = getLogoLimiter('free')
export const briefLimiter = getBriefLimiter('free')

export function getIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return 'unknown'
}
