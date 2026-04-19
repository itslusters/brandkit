export const maxDuration = 15
// Stripe webhook signature verification needs the raw body — opt into Node runtime.
export const runtime = 'nodejs'

import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { upgradeUserTier } from '@/lib/entitlements'
import { isPaidPlan } from '@/lib/stripe'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET not set')
    return new Response('webhook_not_configured', { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('missing_signature', { status: 400 })

  const payload = await req.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret)
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed:', err)
    return new Response('invalid_signature', { status: 400 })
  }

  try {
    // Both events carry the metadata we set on checkout session creation.
    // `checkout.session.completed` fires as soon as payment is collected;
    // `payment_intent.succeeded` is our safety net in case the session event
    // is missed (e.g. async payment methods or flaky delivery).
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      await applyMetadataEntitlement(session.metadata, session.client_reference_id)
    } else if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent
      await applyMetadataEntitlement(intent.metadata, null)
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error:', err)
    // Return 500 so Stripe retries; the upgrade helper is idempotent via rank check.
    return new Response('handler_failed', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}

async function applyMetadataEntitlement(
  metadata: Stripe.Metadata | null | undefined,
  clientReferenceId: string | null,
): Promise<void> {
  const userId = metadata?.userId ?? clientReferenceId
  const plan = metadata?.plan
  if (!userId || !plan || !isPaidPlan(plan)) {
    console.warn('[stripe/webhook] missing userId or plan in event metadata', { userId, plan })
    return
  }
  await upgradeUserTier(userId, plan)
}
