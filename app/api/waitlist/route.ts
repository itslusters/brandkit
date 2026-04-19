import { isValidEmail } from '@/lib/email'
import { isValidWaitlistPlan, recordWaitlist, type WaitlistLocale } from '@/lib/waitlist'
import { sendWaitlistAlert, sendWaitlistWelcome } from '@/lib/resend'
import { waitlistLimiter, getIp } from '@/lib/ratelimit'
import { auth } from '@clerk/nextjs/server'

const MAX_REF_LEN = 40
const REF_RE = /^[a-zA-Z0-9_-]+$/

function sanitizeRef(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > MAX_REF_LEN) return undefined
  return REF_RE.test(trimmed) ? trimmed : undefined
}

function pickLocale(raw: unknown, note: string | undefined): WaitlistLocale {
  if (raw === 'ko' || raw === 'en') return raw
  // Fallback: sniff Hangul in the note so copy stays sane if client forgets the tag.
  if (note && /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(note)) return 'ko'
  return 'en'
}

export async function POST(req: Request) {
  const ip = getIp(req)
  const { success } = await waitlistLimiter.limit(ip)
  if (!success) {
    return Response.json({ error: 'rate_limit', message: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const body = await req.json() as {
    email?: string
    plan?: string
    note?: string
    locale?: string
    ref?: string
  }
  const { email, plan, note } = body

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (!isValidWaitlistPlan(plan)) {
    return Response.json({ error: 'invalid_plan' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const { userId } = await auth()
  const trimmedNote = note?.trim() || undefined
  const locale = pickLocale(body.locale, trimmedNote)
  const ref = sanitizeRef(body.ref)

  const entry = {
    email: normalizedEmail,
    plan,
    note: trimmedNote,
    userId: userId ?? undefined,
    locale,
    ref,
    ts: Date.now(),
  }

  await recordWaitlist(entry)

  // Internal alert + user welcome — both best-effort. A mail outage must not
  // cost a signup, so we swallow errors after logging. Welcome and alert go
  // out concurrently to keep p50 latency down.
  await Promise.allSettled([
    sendWaitlistAlert({
      email: normalizedEmail,
      plan,
      note: trimmedNote,
      userId: entry.userId,
    }).catch((err) => console.error('[waitlist] alert failed:', err)),
    sendWaitlistWelcome({
      to: normalizedEmail,
      plan,
      locale,
    }).catch((err) => console.error('[waitlist] welcome failed:', err)),
  ])

  return Response.json({ ok: true })
}
