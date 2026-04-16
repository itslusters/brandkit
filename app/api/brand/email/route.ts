import { isValidEmail, storeEmail } from '@/lib/email'
import { emailLimiter } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const { email, brandName } = await req.json() as { email?: string; brandName?: string }

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 })
  }

  const normalized = email.trim().toLowerCase()
  const { success } = await emailLimiter.limit(normalized)
  if (!success) {
    return Response.json({ error: 'daily_limit' }, { status: 429 })
  }

  await storeEmail(normalized, brandName ?? 'unknown')
  return Response.json({ ok: true })
}
