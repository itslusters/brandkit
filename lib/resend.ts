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
 * Welcome email dispatched the moment someone joins the waitlist. Bilingual
 * (en/ko) so the copy actually feels native — machine translation reads like
 * spam and kills the subscribe-through. Fire-and-forget from the API; never
 * bubble a mail outage back to the signup flow.
 */
export async function sendWaitlistWelcome(args: {
  to: string
  plan: 'essentials' | 'pro'
  locale: 'en' | 'ko'
}): Promise<void> {
  const planLabel = args.plan === 'pro' ? 'Pro' : 'Essentials'
  const homeUrl = args.locale === 'ko' ? `${APP_URL}/ko` : APP_URL
  const brandNewUrl = `${APP_URL}/brand/new`

  const subject = args.locale === 'ko'
    ? `Atriium 웨이팅 리스트 등록 완료`
    : `You're on the Atriium ${planLabel} waitlist`

  const html = args.locale === 'ko'
    ? `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;line-height:1.6;max-width:560px;margin:0 auto;padding:32px 24px;color:#0a0a0b">
        <p style="font-size:12px;font-weight:600;color:#71717a;margin:0 0 8px">ATRIIUM</p>
        <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">웨이팅 리스트에 등록됐어요.</h1>
        <p style="font-size:15px;color:#52525b;margin:0 0 16px">
          정식 오픈 1주 전에 이메일로 먼저 알려드려요. 얼리버드 유저는 첫 3개월 <strong style="color:#0a0a0b">월 9,900원</strong> (정가 월 25,000원).
        </p>
        <p style="font-size:15px;color:#52525b;margin:0 0 24px">
          그동안 Free 티어로 브랜드 브리프, 로고 3개 변형, A/B 폴까지 바로 써볼 수 있어요 — 벡터 SVG와 상업적 사용권은 정식 출시 때 열려요.
        </p>
        <a href="${brandNewUrl}" style="display:inline-block;background:#0a0a0b;color:#ffffff;font-weight:600;padding:12px 20px;border-radius:999px;text-decoration:none;font-size:14px">지금 브랜드 만들어보기 →</a>
        <p style="font-size:12px;color:#a1a1aa;margin-top:40px">
          이 메일은 Atriium 웨이팅 리스트에 등록하셔서 받으신 메일이에요. 문의는 이 메일에 답장하시면 됩니다.
        </p>
      </div>
    `
    : `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;line-height:1.6;max-width:560px;margin:0 auto;padding:32px 24px;color:#0a0a0b">
        <p style="font-size:12px;font-weight:600;color:#71717a;margin:0 0 8px">ATRIIUM</p>
        <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">You're on the ${planLabel} list.</h1>
        <p style="font-size:15px;color:#52525b;margin:0 0 16px">
          We'll email you a week before ${planLabel} drops on iOS — so you get first crack at the launch-day pricing.
        </p>
        <p style="font-size:15px;color:#52525b;margin:0 0 24px">
          In the meantime, the free tier is already open: brand brief, three logo variants, A/B voting. Vector SVG and commercial rights unlock at launch.
        </p>
        <a href="${brandNewUrl}" style="display:inline-block;background:#0a0a0b;color:#ffffff;font-weight:600;padding:12px 20px;border-radius:999px;text-decoration:none;font-size:14px">Try a brand now →</a>
        <p style="font-size:12px;color:#a1a1aa;margin-top:40px">
          You're getting this because you joined the Atriium waitlist at ${homeUrl}. Reply to this email if anything breaks.
        </p>
      </div>
    `

  try {
    await resend.emails.send({ from: FROM, to: args.to, subject, html })
  } catch (err) {
    console.error('[email] waitlist welcome failed:', err)
  }
}

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
