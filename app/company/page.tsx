import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    title: '1. Tell us about the brand',
    body: 'A 30-second brief — name (or leave blank for AI naming), industry, tones, and an optional style pack.',
  },
  {
    title: '2. Claude drafts the brief',
    body: 'Industry positioning, recommended style, a 3-color palette, typography pairings, and an avoid list — streamed live.',
  },
  {
    title: '3. Recraft forges the logo',
    body: 'Three logo candidates per type (wordmark, symbol+text, emblem) drawn to your brief — vector-ready.',
  },
  {
    title: '4. It lives in your workspace',
    body: 'Saved to your account forever. Next request builds on the same DNA — colors, type, trained style.',
  },
]

const pillars = [
  {
    title: 'Brand memory',
    body: 'Your DNA — colors, type, trained style — is saved. The next request starts where the last one ended. ChatGPT forgets; Atriium remembers.',
  },
  {
    title: 'A full system',
    body: 'Logo, palette, typography, 9 mockups, PDF brand guide, vector SVG, asset pack ZIP. Not one PNG — a kit.',
  },
  {
    title: 'Designer handoff path',
    body: 'When the stakes matter, route your AI draft to a real designer on Pro or Studio. Polished in 2–3 days, not 2 weeks.',
  },
  {
    title: 'Brand evolution',
    body: 'Seasonal marks, sub-brands, campaign variants — all generated from the same root so they feel related instead of cousin-brands.',
  },
]

const faqs = [
  {
    q: 'How long does generation take?',
    a: 'About 60–90 seconds end to end — brief streaming takes ~20s, each logo variation 10–15s, mockups compose in parallel.',
  },
  {
    q: 'Can I use the assets commercially?',
    a: 'Yes. You own the output and can use it in any commercial context. Pro tier additionally includes a human designer refining the final logo.',
  },
  {
    q: 'What\'s the difference between Essentials and Solo?',
    a: 'Essentials ($29 once) unlocks the full kit for one brand — vector, PDF, ZIP, no watermarks. Solo ($19/mo) adds unlimited regenerations, new mockup templates each month, and keeps your trained style alive.',
  },
  {
    q: 'What\'s the designer polish?',
    a: 'A real designer hand-refines your AI-generated mark and delivers a polished, revision-ready file in 2–3 business days. Included once on Pro, monthly on Studio.',
  },
  {
    q: 'Will my brand be public?',
    a: 'No — private by default. You can opt into a public share link per brand, which gives you a URL to send and a dedicated OG card for social previews.',
  },
  {
    q: 'Is my email shared?',
    a: 'No. We use it for auth, save confirmations, and tier updates. Never sold, never used for marketing outside Atriium.',
  },
]

export default function CompanyPage() {
  return (
    <div className="pb-16 space-y-16 md:space-y-20">
      {/* Masthead */}
      <div>
        <p className="eyebrow mb-4">About Atriium</p>
        <h1 className="display-2 text-white mb-5">Your brand&apos;s home.</h1>
        <p className="text-zinc-400 text-base md:text-lg max-w-2xl leading-relaxed">
          Atriium is a brand workspace — not another logo generator. Ship a full
          identity in ten minutes, then come back tomorrow, next season, next
          launch, and evolve it from the same DNA.
        </p>
      </div>

      {/* Pillars — the story of why Atriium exists */}
      <ScrollReveal>
        <section>
          <p className="eyebrow mb-5">Why it exists</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-6 card-elevated"
              >
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Flow */}
      <ScrollReveal>
        <section>
          <p className="eyebrow mb-5">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {steps.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-6 card-elevated"
              >
                <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* FAQ */}
      <ScrollReveal>
        <section>
          <p className="eyebrow mb-5">FAQ</p>
          <div className="space-y-2">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-5 card-elevated group"
              >
                <summary className="cursor-pointer text-sm font-semibold text-white list-none flex items-center justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="text-zinc-500 group-open:rotate-45 transition-transform text-lg leading-none shrink-0">+</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="relative rounded-3xl border border-zinc-800/70 bg-zinc-900/40 overflow-hidden p-8 md:p-12">
          <div className="aurora-glow w-[500px] h-[300px] bg-blue-600/15 top-[-80px] left-[-80px]" style={{ animationDelay: '0s' }} />
          <div className="aurora-glow w-[400px] h-[300px] bg-violet-600/10 bottom-[-80px] right-[-80px]" style={{ animationDelay: '2s' }} />
          <div className="relative">
            <p className="eyebrow mb-3">Ready when you are</p>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight mb-3">
              Ten minutes to your brand.
            </h2>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-6">
              Free to try. No credit card for the first draft.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/brand/new" className="btn btn-primary">
                Start building <ArrowRight size={15} />
              </a>
              <a href="/pricing" className="btn btn-secondary">
                See plans
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <footer className="pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
        <div className="flex gap-4 flex-wrap">
          <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="/sign-in" className="hover:text-white transition-colors">Sign in</a>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          <a href="mailto:we.lusters@gmail.com" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div>© 2026 Atriium</div>
      </footer>
    </div>
  )
}
