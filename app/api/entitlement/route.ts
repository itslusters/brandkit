import { getEntitlement } from '@/lib/entitlement-check'

/**
 * Public entitlement check — the client `useEntitlement` hook confirms server
 * truth against this (after optimistically unlocking from RevenueCat
 * customerInfo). Reads the requester's tier from Clerk (signed-in) or the
 * x-anon-id header (friction-zero).
 */
export async function GET(req: Request) {
  const { tier, unlocked, source } = await getEntitlement(req)
  return Response.json({ tier, unlocked, source })
}
