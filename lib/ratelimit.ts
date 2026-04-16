import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const briefLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(20, '24 h'),
  prefix: 'rl:brief',
  analytics: false,
})

export const logoLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, '24 h'),
  prefix: 'rl:logo',
  analytics: false,
})

export const emailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(1, '24 h'),
  prefix: 'rl:email',
  analytics: false,
})

export function getIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return 'unknown'
}
