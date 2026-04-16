import { isValidEmail } from '@/lib/email'
import { isValidWaitlistPlan, recordWaitlist } from '@/lib/waitlist'
import { sendWaitlistAlert } from '@/lib/resend'
import { waitlistLimiter, getIp } from '@/lib/ratelimit'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const ip = getIp(req)
  const { success } = await waitlistLimiter.limit(ip)
  if (!success) {
    return Response.json({ error: 'rate_limit', message: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { email, plan, note } = await req.json() as { email?: string; plan?: string; note?: string }

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (!isValidWaitlistPlan(plan)) {
    return Response.json({ error: 'invalid_plan' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const { userId } = await auth()

  const entry = {
    email: normalizedEmail,
    plan,
    note: note?.trim() || undefined,
    userId: userId ?? undefined,
    ts: Date.now(),
  }

  await recordWaitlist(entry)

  // Email is best-effort — don't break the user flow if Resend fails
  try {
    await sendWaitlistAlert({ email: normalizedEmail, plan, note: entry.note, userId: entry.userId })
  } catch (err) {
    console.error('[waitlist] resend failed:', err)
  }

  return Response.json({ ok: true })
}
