import 'server-only'
import Stripe from 'stripe'

// Lazily construct so dev environments without STRIPE_SECRET_KEY don't blow up
// on import. Routes that need Stripe should call `getStripe()`.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  _stripe = new Stripe(key, {
    // Pin API version so webhook payload shapes stay stable.
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
  })
  return _stripe
}

/**
 * Maps our internal one-time purchase plans to Stripe Price IDs.
 * Configured via env so the same codebase can use test/live price IDs.
 *
 * Create these in Stripe Dashboard as one-time prices (not recurring):
 *   - Essentials: $29 one-time
 *   - Pro: $149 one-time
 */
export type PaidPlan = 'essentials' | 'pro'

export function getPriceId(plan: PaidPlan): string {
  const envKey = plan === 'essentials' ? 'STRIPE_PRICE_ESSENTIALS' : 'STRIPE_PRICE_PRO'
  const id = process.env[envKey]
  if (!id) throw new Error(`${envKey} is not set`)
  return id
}

export function isPaidPlan(x: string): x is PaidPlan {
  return x === 'essentials' || x === 'pro'
}
