import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(raw: string): boolean {
  return EMAIL_RE.test(raw.trim())
}

export async function storeEmail(email: string, brandName: string): Promise<void> {
  const entry = `${email.trim()}|${brandName}|${Date.now()}`
  await redis.lpush('emails', entry)
}
