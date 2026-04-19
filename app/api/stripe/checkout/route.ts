export const maxDuration = 15

import { auth, currentUser } from '@clerk/nextjs/server'
import { getStripe, getPriceId, isPaidPlan } from '@/lib/stripe'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  let body: { plan?: string } = {}
  try { body = await req.json() } catch { /* empty body is ok */ }
  const plan = body.plan
  if (!plan || !isPaidPlan(plan)) {
    return Response.json({ error: 'invalid_plan' }, { status: 400 })
  }

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://brandkit-wheat.vercel.app'

  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: getPriceId(plan), quantity: 1 }],
      success_url: `${origin}/account?upgrade=success&plan=${plan}`,
      cancel_url: `${origin}/pricing?cancelled=1`,
      customer_email: email,
      // Clerk userId + plan go into metadata so the webhook can update entitlements
      // without trusting client state on the success page.
      client_reference_id: userId,
      metadata: { userId, plan },
      payment_intent_data: {
        metadata: { userId, plan },
      },
      allow_promotion_codes: true,
    })
    if (!session.url) {
      return Response.json({ error: 'no_session_url' }, { status: 500 })
    }
    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout] error:', err)
    const message = err instanceof Error ? err.message : 'checkout_failed'
    return Response.json({ error: 'checkout_failed', message }, { status: 500 })
  }
}
