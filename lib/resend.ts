import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.WAITLIST_FROM_EMAIL ?? 'onboarding@resend.dev'
const TO = process.env.WAITLIST_NOTIFY_EMAIL ?? 'we.lusters@gmail.com'

export async function sendWaitlistAlert(args: {
  email: string
  plan: string
  note?: string
  userId?: string
}): Promise<void> {
  const subject = `New waitlist signup (${args.plan})`
  const html = `
    <div style="font-family:sans-serif;line-height:1.5">
      <h2>New ${args.plan} waitlist signup</h2>
      <p><strong>Email:</strong> ${args.email}</p>
      ${args.userId ? `<p><strong>Clerk user ID:</strong> ${args.userId}</p>` : ''}
      ${args.note ? `<p><strong>Note:</strong> ${args.note}</p>` : ''}
      <p style="color:#666;font-size:12px">${new Date().toISOString()}</p>
    </div>
  `
  await resend.emails.send({ from: FROM, to: TO, subject, html })
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://brandkit-wheat.vercel.app'

/**
 * Sends the user a confirmation when their brand lands in the library.
 * Best-effort — never let a mail failure surface to the save flow, since
 * the brand itself is already persisted. Logs + swallows.
 */
export async function sendBrandSavedConfirmation(args: {
  to: string
  brandName: string
  brandId: string
  logoUrl?: string
}): Promise<void> {
  const brandUrl = `${APP_URL}/brand/saved/${args.brandId}`
  const subject = `${args.brandName} is saved to your Atriium library`
  const logoBlock = args.logoUrl
    ? `<div style="margin:24px 0;padding:24px;background:#ffffff;border-radius:16px;text-align:center"><img src="${args.logoUrl}" alt="${args.brandName}" style="max-height:120px;max-width:320px"/></div>`
    : ''
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;line-height:1.5;max-width:560px;margin:0 auto;padding:32px 24px;color:#0a0a0b">
      <p style="font-size:12px;font-weight:600;color:#71717a;margin:0 0 8px">ATRIIUM</p>
      <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">Your brand is saved.</h1>
      <p style="font-size:15px;color:#52525b;margin:0">
        <strong style="color:#0a0a0b">${args.brandName}</strong> is now in your library. Re-download assets, share a public link, or evolve it into a new season anytime.
      </p>
      ${logoBlock}
      <a href="${brandUrl}" style="display:inline-block;background:#0a0a0b;color:#ffffff;font-weight:600;padding:12px 20px;border-radius:999px;text-decoration:none;font-size:14px;margin-top:8px">Open brand →</a>
      <p style="font-size:12px;color:#a1a1aa;margin-top:40px">
        You're getting this because you saved a brand on Atriium. Reply if anything breaks.
      </p>
    </div>
  `
  try {
    await resend.emails.send({ from: FROM, to: args.to, subject, html })
  } catch (err) {
    console.error('[email] brand-saved confirmation failed:', err)
  }
}
