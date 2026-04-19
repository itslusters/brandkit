import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The rules and responsibilities of using Atriium.',
}

const UPDATED = 'April 19, 2026'

export default function TermsPage() {
  return (
    <article className="prose prose-invert max-w-none pt-4 pb-16 text-sm leading-relaxed text-zinc-300">
      <h1 className="text-xl font-bold text-white mb-1">Terms of Service</h1>
      <p className="text-xs text-zinc-500 mb-8">Last updated: {UPDATED}</p>

      <p>
        By using Atriium (the &quot;Service&quot;), you agree to these Terms. If you do not agree, do
        not use the Service.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">1. Eligibility</h2>
      <p>You must be at least 13 years old (or the age of digital consent in your jurisdiction) to use Atriium.</p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">2. Your account</h2>
      <p>
        You are responsible for maintaining the confidentiality of your credentials and
        for all activity under your account. Notify us immediately of any unauthorized use.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Use the Service to generate content that is illegal, hateful, sexual, or violent.</li>
        <li>Infringe any third party&apos;s intellectual property or publicity rights.</li>
        <li>Reverse-engineer, scrape, or abuse the Service or its APIs.</li>
        <li>Misrepresent AI-generated content as solely human-made in contexts requiring disclosure.</li>
      </ul>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">4. AI-generated output</h2>
      <p>
        You retain rights to the brand inputs you submit and, subject to these Terms and
        the terms of our AI providers, to the outputs you receive. AI output may not be
        unique or suitable for trademark registration; you are responsible for clearing
        any mark before commercial use.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">5. Paid plans</h2>
      <p>
        Paid plans grant additional features per the pricing page. Billing is handled by
        Apple In-App Purchase through the iOS app. Refund policies follow Apple&apos;s rules.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">6. Service changes</h2>
      <p>
        We may modify, suspend, or discontinue features at any time. We will provide
        reasonable notice for material changes affecting paid users.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">7. Disclaimer</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties of any kind. We do not
        guarantee accuracy, availability, or fitness for a particular purpose.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Atriium is not liable for indirect,
        incidental, or consequential damages. Our total liability in any matter is
        capped at the amount you paid us in the 12 months prior to the claim, or $50,
        whichever is greater.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">9. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access
        for violations of these Terms or suspected abuse.
      </p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">10. Governing law</h2>
      <p>These Terms are governed by the laws of the Republic of Korea. Disputes will be resolved in the courts of Seoul.</p>

      <h2 className="text-lg font-semibold text-white mt-8 mb-2">11. Contact</h2>
      <p><a href="mailto:we.lusters@gmail.com" className="text-white underline">we.lusters@gmail.com</a></p>
    </article>
  )
}
