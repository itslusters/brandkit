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
