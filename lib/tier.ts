import { auth } from '@clerk/nextjs/server'

export type UserTier = 'free' | 'essentials' | 'pro'

const VALID: UserTier[] = ['free', 'essentials', 'pro']

export async function getUserTier(): Promise<UserTier> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return 'free'
  const raw = (sessionClaims?.publicMetadata as { tier?: string } | undefined)?.tier
  return raw && (VALID as string[]).includes(raw) ? (raw as UserTier) : 'free'
}

export async function requireTier(min: UserTier): Promise<{ ok: true } | { ok: false; tier: UserTier }> {
  const tier = await getUserTier()
  return VALID.indexOf(tier) >= VALID.indexOf(min)
    ? { ok: true }
    : { ok: false, tier }
}
