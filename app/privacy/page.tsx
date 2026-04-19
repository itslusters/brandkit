import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Atriium collects, uses, and protects your data.',
}

const UPDATED = 'April 19, 2026'

export default function PrivacyPage() {
  return (
    <article className="prose prose-invert max-w-none pt-4 pb-16 text-sm leading-relaxed text-zinc-300">
      <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Privacy Policy</h1>
      <p className="text-xs text-zinc-500 mb-8">Last updated: {UPDATED}</p>

      <p>
        This Privacy Policy explains how Atriium (&quot;we&quot;, &quot;us&quot;) collects, uses, and protects
        information when you use our web and mobile applications (the &quot;Service&quot;).
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">1. Information we collect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Account data</strong>: email, name, and authentication identifiers provided via Clerk when you sign in.</li>
        <li><strong>Brand inputs</strong>: company name, industry, target customer, tones, competitors, and reference uploads you submit to generate brand kits.</li>
        <li><strong>Generated artifacts</strong>: logos, mockups, mood images, and brand guides produced by the Service.</li>
        <li><strong>Usage data</strong>: page views, interactions, and performance metrics via Vercel Analytics and Sentry.</li>
        <li><strong>Device info</strong>: IP address, browser or OS version, used for rate limiting and abuse prevention.</li>
      </ul>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">2. How we use it</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Provide the brand-kit generation features you request.</li>
        <li>Process payments for paid tiers (via Apple in-app purchase on iOS).</li>
        <li>Send transactional emails (e.g., waitlist confirmation).</li>
        <li>Detect and prevent abuse, enforce rate limits, and troubleshoot errors.</li>
        <li>Improve the Service through aggregated, anonymized analytics.</li>
      </ul>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">3. AI processing</h2>
      <p>
        Brand inputs are sent to third-party AI providers (Anthropic, Recraft) to generate
        names, logos, and images. These providers process your input under their own
        privacy terms. We do not train models on your data.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">4. Storage &amp; retention</h2>
      <p>
        Generated assets are stored on Vercel Blob and Upstash Redis. Logged-in users can
        delete their saved brands at any time from their account page. Deleted data is
        purged within 30 days.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">5. Sharing</h2>
      <p>
        We do not sell your personal data. We share data only with processors necessary
        to run the Service: Clerk (auth), Vercel (hosting, analytics, blob storage),
        Upstash (cache/rate limit), Apple (iOS in-app purchase), RevenueCat
        (purchase receipts and entitlements), Anthropic and Recraft (AI
        generation), Resend (email), and Sentry (error monitoring).
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">6. Your rights</h2>
      <p>
        You may request access, correction, or deletion of your personal data at any
        time by contacting <a href="mailto:we.lusters@gmail.com" className="text-white underline">we.lusters@gmail.com</a>.
        EEA, UK, and California residents have additional rights under GDPR and CCPA.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">7. Children</h2>
      <p>The Service is not directed to children under 13 and we do not knowingly collect their data.</p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">8. Changes</h2>
      <p>
        We may update this policy. Material changes will be announced in the app or by
        email. Continued use after changes constitutes acceptance.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">9. Contact</h2>
      <p>Questions: <a href="mailto:we.lusters@gmail.com" className="text-white underline">we.lusters@gmail.com</a>.</p>
    </article>
  )
}
