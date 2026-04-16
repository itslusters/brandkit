import 'server-only'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export type WaitlistPlan = 'essentials' | 'pro'

export interface WaitlistEntry {
  email: string
  plan: WaitlistPlan
  note?: string
  userId?: string
  ts: number
}

const VALID_PLANS: WaitlistPlan[] = ['essentials', 'pro']

export function isValidWaitlistPlan(value: unknown): value is WaitlistPlan {
  return typeof value === 'string' && (VALID_PLANS as string[]).includes(value)
}

export async function recordWaitlist(entry: WaitlistEntry): Promise<void> {
  await redis.lpush('waitlist', JSON.stringify(entry))
  await redis.sadd(`waitlist:by-email:${entry.email}`, entry.plan)
}

export async function getWaitlistFor(email: string): Promise<WaitlistPlan[]> {
  const members = await redis.smembers(`waitlist:by-email:${email}`)
  return (members as string[]).filter(isValidWaitlistPlan)
}
