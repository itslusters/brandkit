export const maxDuration = 15
export const runtime = 'nodejs'

import { upgradeUserTier } from '@/lib/entitlements'
import type { UserTier } from '@/lib/tier'

/**
 * RevenueCat webhook — https://www.revenuecat.com/docs/integrations/webhooks
 *
 * Authentication: RevenueCat posts a bearer token in the `Authorization`
 * header, whose value is configured in their dashboard. We compare against
 * `REVENUECAT_WEBHOOK_SECRET`. This gives us server-verified entitlement
 * updates without needing to validate App Store receipts ourselves.
 *
 * Event types we care about:
 *   INITIAL_PURCHASE / NON_RENEWING_PURCHASE → grant tier
 *   TRANSFER                                 → grant tier on the new user
 *   Everything else (RENEWAL, CANCELLATION, EXPIRATION for subscriptions,
 *   PRODUCT_CHANGE, BILLING_ISSUE, …) — ignored because our products are
 *   non-consumable lifetime unlocks. Refunds happen out-of-band.
 */

interface RevenueCatEvent {
  type: string
  app_user_id: string
  original_app_user_id?: string
  product_id?: string
  entitlement_ids?: string[] | null
}

interface RevenueCatWebhookPayload {
  event: RevenueCatEvent
  api_version?: string
}

const PRODUCT_TO_TIER: Record<string, UserTier> = {
  'kiln.essentials.onetime': 'essentials',
  'kiln.pro.onetime': 'pro',
}

const ENTITLEMENT_TO_TIER: Record<string, UserTier> = {
  essentials: 'essentials',
  pro: 'pro',
}

const GRANTING_EVENTS = new Set(['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE', 'TRANSFER', 'UNCANCELLATION'])

export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET
  if (!secret) {
    console.error('[revenuecat/webhook] REVENUECAT_WEBHOOK_SECRET not set')
    return new Response('webhook_not_configured', { status: 500 })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  if (authHeader !== expected) {
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

  if (!GRANTING_EVENTS.has(event.type)) {
    // Acknowledge so RevenueCat doesn't keep retrying events we explicitly ignore.
    return new Response('ignored', { status: 200 })
  }

  const tier = resolveTier(event)
  if (!tier) {
    console.warn('[revenuecat/webhook] could not resolve tier from event:', {
      product_id: event.product_id,
      entitlement_ids: event.entitlement_ids,
    })
    return new Response('no_tier_match', { status: 200 })
  }

  try {
    await upgradeUserTier(event.app_user_id, tier)
  } catch (err) {
    console.error('[revenuecat/webhook] entitlement update failed:', err)
    return new Response('handler_failed', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}

function resolveTier(event: RevenueCatEvent): UserTier | null {
  for (const id of event.entitlement_ids ?? []) {
    if (ENTITLEMENT_TO_TIER[id]) return ENTITLEMENT_TO_TIER[id]
  }
  if (event.product_id && PRODUCT_TO_TIER[event.product_id]) {
    return PRODUCT_TO_TIER[event.product_id]
  }
  return null
}
