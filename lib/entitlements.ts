import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import type { UserTier } from './tier'

/**
 * Atomically upgrade a user's tier. Only applied if the new tier outranks
 * what's already stored — so a webhook retrying after an upgrade doesn't
 * accidentally downgrade someone, and so `essentials` payers who later buy
 * `pro` aren't clobbered by a replay of the earlier Stripe event.
 */
const RANK: Record<UserTier, number> = { free: 0, essentials: 1, pro: 2 }

export async function upgradeUserTier(userId: string, tier: UserTier): Promise<UserTier> {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const current = ((user.publicMetadata as { tier?: UserTier } | null | undefined)?.tier) ?? 'free'
  if (RANK[tier] <= RANK[current]) return current
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { ...user.publicMetadata, tier },
  })
  return tier
}
