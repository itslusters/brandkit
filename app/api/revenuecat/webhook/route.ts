export const maxDuration = 15
export const runtime = 'nodejs'

import {
  grantOnetimeTier,
  grantSubscriptionTier,
  revokeSubscriptionTier,
} from '@/lib/entitlements'
import {
  grantAnonOnetime,
  grantAnonSubscription,
  revokeAnonSubscription,
} from '@/lib/anon-entitlement'
import {
  isOnetimeTier,
  isSubscriptionTier,
  type OnetimeTier,
  type SubscriptionTier,
} from '@/lib/tier'

/**
 * Route an entitlement change to the right store by the shape of the RevenueCat
 * App User ID: a Clerk userId ("user_…") → Clerk publicMetadata (signed-in
 * buyers); anything else → the anon-entitlement Upstash store (friction-zero
 * buyers whose App User ID is our device anon id). Both stores share the same
 * two-bucket / never-downgrade semantics.
 */
const isClerkId = (id: string) => id.startsWith('user_')

function grantOnetime(id: string, tier: OnetimeTier) {
  return isClerkId(id) ? grantOnetimeTier(id, tier) : grantAnonOnetime(id, tier)
}
function grantSubscription(id: string, tier: SubscriptionTier) {
  return isClerkId(id) ? grantSubscriptionTier(id, tier) : grantAnonSubscription(id, tier)
}
function revokeSubscription(id: string) {
  return isClerkId(id) ? revokeSubscriptionTier(id) : revokeAnonSubscription(id)
}

/**
 * RevenueCat webhook — https://www.revenuecat.com/docs/integrations/webhooks
 *
 * Authentication: RevenueCat posts a bearer token in the `Authorization`
 * header, whose value is configured in their dashboard. We compare against
 * `REVENUECAT_WEBHOOK_SECRET`.
 *
 * Product / entitlement mapping:
 *   - atriium.essentials.onetime / entitlement "essentials" → one-time Essentials
 *   - atriium.pro.onetime        / entitlement "pro"        → one-time Pro
 *   - atriium.solo.monthly       / entitlement "solo"       → auto-renewable Solo
 *   - atriium.studio.monthly     / entitlement "studio"     → auto-renewable Studio
 *
 * Event routing:
 *   GRANT (onetime):     NON_RENEWING_PURCHASE                    → grantOnetimeTier
 *   GRANT (subscription): INITIAL_PURCHASE, RENEWAL,
 *                         UNCANCELLATION, TRANSFER                → grantSubscriptionTier
 *   REVOKE (subscription): EXPIRATION, SUBSCRIPTION_PAUSED        → revokeSubscriptionTier
 *   IGNORE: CANCELLATION (access runs to period end — the
 *           EXPIRATION event at that time is what we act on),
 *           BILLING_ISSUE, PRODUCT_CHANGE, TEST.
 *
 * CANCELLATION is intentionally ignored because Apple subscriptions stay
 * active until the end of the billing period after cancellation; we wait for
 * EXPIRATION to actually revoke. Otherwise users who cancel mid-month would
 * lose access immediately, which breaks App Store review expectations.
 */

type EventType =
  | 'INITIAL_PURCHASE'
  | 'NON_RENEWING_PURCHASE'
  | 'RENEWAL'
  | 'UNCANCELLATION'
  | 'TRANSFER'
  | 'CANCELLATION'
  | 'EXPIRATION'
  | 'SUBSCRIPTION_PAUSED'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE'
  | 'TEST'

interface RevenueCatEvent {
  type: EventType | string
  app_user_id: string
  original_app_user_id?: string
  product_id?: string
  entitlement_ids?: string[] | null
}

interface RevenueCatWebhookPayload {
  event: RevenueCatEvent
  api_version?: string
}

const PRODUCT_TO_ONETIME: Record<string, OnetimeTier> = {
  'atriium.essentials.onetime': 'essentials',
  'atriium.pro.onetime': 'pro',
}

const PRODUCT_TO_SUBSCRIPTION: Record<string, SubscriptionTier> = {
  'atriium.solo.monthly': 'solo',
  'atriium.studio.monthly': 'studio',
}

export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET
  if (!secret) {
    console.error('[revenuecat/webhook] REVENUECAT_WEBHOOK_SECRET not set')
    return new Response('webhook_not_configured', { status: 500 })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  if (authHeader !== `Bearer ${secret}`) {
    return new Response('unauthorized', { status: 401 })
  }

  let body: RevenueCatWebhookPayload
  try {
    body = await req.json()
  } catch {
    return new Response('invalid_json', { status: 400 })
  }

  const event = body.event
  if (!event?.type || !event.app_user_id) {
    return new Response('invalid_event', { status: 400 })
  }

  try {
    await routeEvent(event)
  } catch (err) {
    console.error('[revenuecat/webhook] handler error:', err)
    return new Response('handler_failed', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}

async function routeEvent(event: RevenueCatEvent): Promise<void> {
  const userId = event.app_user_id

  switch (event.type) {
    case 'NON_RENEWING_PURCHASE': {
      const tier = resolveOnetime(event)
      if (tier) await grantOnetime(userId, tier)
      else logUnresolved(event)
      return
    }
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'TRANSFER': {
      // For subscription products this path fires. INITIAL_PURCHASE can ALSO
      // fire for one-time products in some Apple configurations, so we
      // fall through to onetime resolution if subscription lookup misses.
      const subTier = resolveSubscription(event)
      if (subTier) {
        await grantSubscription(userId, subTier)
        return
      }
      const oneTier = resolveOnetime(event)
      if (oneTier) {
        await grantOnetime(userId, oneTier)
        return
      }
      logUnresolved(event)
      return
    }
    case 'EXPIRATION':
    case 'SUBSCRIPTION_PAUSED': {
      await revokeSubscription(userId)
      return
    }
    default:
      // CANCELLATION / BILLING_ISSUE / PRODUCT_CHANGE / TEST — no-op.
      return
  }
}

function resolveOnetime(event: RevenueCatEvent): OnetimeTier | null {
  for (const id of event.entitlement_ids ?? []) {
    if (isOnetimeTier(id)) return id
  }
  if (event.product_id && PRODUCT_TO_ONETIME[event.product_id]) {
    return PRODUCT_TO_ONETIME[event.product_id]
  }
  return null
}

function resolveSubscription(event: RevenueCatEvent): SubscriptionTier | null {
  for (const id of event.entitlement_ids ?? []) {
    if (isSubscriptionTier(id)) return id
  }
  if (event.product_id && PRODUCT_TO_SUBSCRIPTION[event.product_id]) {
    return PRODUCT_TO_SUBSCRIPTION[event.product_id]
  }
  return null
}

function logUnresolved(event: RevenueCatEvent): void {
  console.warn('[revenuecat/webhook] could not resolve tier from event:', {
    type: event.type,
    product_id: event.product_id,
    entitlement_ids: event.entitlement_ids,
  })
}
