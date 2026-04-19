import { auth, currentUser } from '@clerk/nextjs/server'
import { getUserTier } from '@/lib/tier'
import { getWaitlistFor } from '@/lib/waitlist'
import { redirect } from 'next/navigation'
import { StaggerChildren, StaggerItem } from '@/components/ui/StaggerChildren'
import { RestorePurchasesButton } from '@/components/RestorePurchasesButton'

interface SearchParams {
  upgrade?: string
  plan?: string
}

const TIER_LABEL: Record<string, string> = {
  free: 'Free',
  essentials: 'Essentials (one-time)',
  solo: 'Solo — $19/month',
  pro: 'Pro (one-time)',
  studio: 'Studio — $79/month',
}

const TIER_BLURB: Record<string, string> = {
  free: 'AI brief, 3 logo variants, 9 watermarked mockup previews. Your brand is saved but downloads are locked.',
  essentials: 'Clean PNG, vector SVG, PDF guide, asset pack ZIP. One brand saved forever.',
  solo: 'Everything in Essentials + unlimited regen + new mockup templates monthly + brand memory.',
  pro: 'Essentials + designer hand-polished logo delivered in 2–3 days.',
  studio: 'Solo + 1 designer polish every month + custom-trained brand style + priority queue + multi-brand workspace.',
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const tier = await getUserTier()
  const waitlists = email ? await getWaitlistFor(email) : []
  const sp = await searchParams
  const upgradeSuccess = sp.upgrade === 'success' &&
    (sp.plan === 'essentials' || sp.plan === 'pro' || sp.plan === 'solo' || sp.plan === 'studio')
  const isPaid = tier !== 'free'

  return (
    <StaggerChildren className="pt-4 pb-12">
      <StaggerItem>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Account</h1>
        </div>
      </StaggerItem>

      {upgradeSuccess && (
        <StaggerItem>
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="text-sm font-medium text-emerald-400">Payment received. Your {sp.plan} upgrade is being activated.</p>
            <p className="text-xs text-zinc-500 mt-1">
              If you don&apos;t see the new plan reflected below within a minute, refresh the page — the entitlement webhook runs asynchronously.
            </p>
          </div>
        </StaggerItem>
      )}

      <StaggerItem>
        <section className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Logged in as</p>
          <p className="text-base text-white">{email}</p>
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current plan</p>
          <p className="text-base text-white">{TIER_LABEL[tier] ?? 'Free'}</p>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed max-w-md">{TIER_BLURB[tier]}</p>
          {!isPaid && (
            <a
              href="/pricing"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-white underline decoration-zinc-600 decoration-dotted underline-offset-4 hover:decoration-white transition-colors"
            >
              Unlock full downloads from $19/mo →
            </a>
          )}
        </section>
      </StaggerItem>

      <StaggerItem>
        <section className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Library</p>
          <a
            href="/account/brands"
            className="inline-block text-sm text-zinc-300 hover:text-white underline"
          >
            Your saved brands →
          </a>
        </section>
      </StaggerItem>

      <StaggerItem>
        <RestorePurchasesButton />
      </StaggerItem>

      <StaggerItem>
        <section className="mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Waitlist signups</p>
          {waitlists.length === 0 ? (
            <p className="text-sm text-zinc-500">
              You haven&apos;t joined any waitlists. <a href="/pricing" className="underline text-zinc-300">Visit pricing</a> to learn more.
            </p>
          ) : (
            <ul className="space-y-1">
              {waitlists.map((p) => (
                <li key={p} className="text-sm text-zinc-300 capitalize">{p} — joined</li>
              ))}
            </ul>
          )}
        </section>
      </StaggerItem>
    </StaggerChildren>
  )
}
