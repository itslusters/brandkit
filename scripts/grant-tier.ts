/**
 * Dogfood helper — grants a tier directly via the Clerk REST API so the
 * owner can use paid features locally without going through Apple IAP or
 * RevenueCat. Mirrors what the RevenueCat webhook would set: writes
 * `tier`, `tier_onetime`, `tier_subscription` into Clerk publicMetadata.
 *
 *   node --env-file=.env.local --import tsx scripts/grant-tier.ts
 *   node --env-file=.env.local --import tsx scripts/grant-tier.ts you@example.com studio
 *
 * After running, sign out and sign back in on the device so the new
 * session claims pick up the updated metadata.
 */

const DEFAULT_EMAIL = 'mokkymin@naver.com'
const DEFAULT_TIER = 'studio'

const VALID_TIERS = ['free', 'essentials', 'solo', 'pro', 'studio'] as const
type Tier = (typeof VALID_TIERS)[number]

async function main() {
  const email = process.argv[2] ?? DEFAULT_EMAIL
  const tier = (process.argv[3] ?? DEFAULT_TIER) as Tier

  if (!VALID_TIERS.includes(tier)) {
    console.error(`Invalid tier "${tier}". Valid: ${VALID_TIERS.join(', ')}`)
    process.exit(1)
  }

  const secret = process.env.CLERK_SECRET_KEY
  if (!secret) {
    console.error('CLERK_SECRET_KEY missing. Run with: npx tsx --env-file=.env.local scripts/grant-tier.ts')
    process.exit(1)
  }

  const headers = {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  }

  const lookup = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    { headers },
  )
  if (!lookup.ok) {
    console.error(`Lookup failed: ${lookup.status} ${await lookup.text()}`)
    process.exit(1)
  }
  const users = (await lookup.json()) as Array<{ id: string }>
  if (users.length === 0) {
    console.error(`No Clerk user found for ${email}`)
    process.exit(1)
  }
  const user = users[0]
  console.log(`Found ${email} → ${user.id}`)

  const onetime = tier === 'pro' || tier === 'studio' ? 'pro' : tier === 'essentials' ? 'essentials' : null
  const subscription = tier === 'studio' ? 'studio' : tier === 'solo' ? 'solo' : null

  const patch = await fetch(`https://api.clerk.com/v1/users/${user.id}/metadata`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      public_metadata: {
        tier,
        tier_onetime: onetime,
        tier_subscription: subscription,
      },
    }),
  })
  if (!patch.ok) {
    console.error(`Update failed: ${patch.status} ${await patch.text()}`)
    process.exit(1)
  }

  console.log(`✓ Granted ${tier} (onetime=${onetime}, subscription=${subscription}) to ${email}`)
  console.log('  Sign out + sign back in on the app to refresh session claims.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
