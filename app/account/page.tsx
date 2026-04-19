import { auth, currentUser } from '@clerk/nextjs/server'
import { getUserTier } from '@/lib/tier'
import { getWaitlistFor } from '@/lib/waitlist'
import { countBrands, FREE_TIER_BRAND_LIMIT } from '@/lib/brands'
import { redirect } from 'next/navigation'
import { ArrowRight, FolderOpen, Sparkles, Check } from 'lucide-react'
import { StaggerChildren, StaggerItem } from '@/components/ui/StaggerChildren'
import { RestorePurchasesButton } from '@/components/RestorePurchasesButton'

interface SearchParams {
  upgrade?: string
  plan?: string
}

const TIER_LABEL: Record<string, string> = {
  free: 'Free',
  essentials: 'Essentials',
  solo: 'Solo',
  pro: 'Pro',
  studio: 'Studio',
}

const TIER_SUFFIX: Record<string, string> = {
  free: '',
  essentials: 'one-time',
  solo: '$19 / month',
  pro: 'one-time',
  studio: '$79 / month',
}

const TIER_BLURB: Record<string, string> = {
  free: 'AI brief, 3 logo variants, watermarked PNG preview. Your brand is saved but downloads and mockups are locked.',
  essentials: 'Clean PNG, vector SVG, PDF guide, asset pack ZIP, 9 product mockups. One brand saved forever.',
  solo: 'Everything in Essentials + unlimited regeneration + new mockup templates monthly + brand memory persistence.',
  pro: 'Essentials + a designer hand-polished logo delivered in 2–3 days.',
  studio: 'Solo + 1 designer polish every month + custom-trained brand style + priority queue + multi-brand workspace.',
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const tier = await getUserTier()
  const [waitlists, brandCount] = await Promise.all([
    email ? getWaitlistFor(email) : Promise.resolve([]),
    countBrands(userId),
  ])
  const sp = await searchParams
  const upgradeSuccess = sp.upgrade === 'success' &&
    (sp.plan === 'essentials' || sp.plan === 'pro' || sp.plan === 'solo' || sp.plan === 'studio')
  const isPaid = tier !== 'free'
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'

  return (
    <StaggerChildren className="pt-4 pb-12">
      <StaggerItem>
        <div className="mb-10">
          <p className="eyebrow mb-3">Account</p>
          <h1 className="display-2 text-white">{email ? email.split('@')[0] : 'Your workspace'}</h1>
          <p className="text-zinc-500 text-sm mt-2 truncate">{email}</p>
        </div>
      </StaggerItem>

      {upgradeSuccess && (
        <StaggerItem>
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Check size={16} className="text-emerald-400" strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">Payment received. {TIER_LABEL[sp.plan ?? 'free']} is activating.</p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                The entitlement webhook runs asynchronously. Refresh in a minute if the plan below hasn&apos;t updated.
              </p>
            </div>
          </div>
        </StaggerItem>
      )}

      {/* Stat row — workspace at a glance */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-4">
            <p className="eyebrow mb-1.5">Plan</p>
            <p className="text-lg font-bold text-white leading-tight">{TIER_LABEL[tier] ?? 'Free'}</p>
            {TIER_SUFFIX[tier] && <p className="text-[11px] text-zinc-500 mt-0.5">{TIER_SUFFIX[tier]}</p>}
          </div>
          <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-4">
            <p className="eyebrow mb-1.5">Brands saved</p>
            <p className="text-lg font-bold text-white leading-tight tabular-nums">
              {brandCount}
              {!isPaid && <span className="text-zinc-500 font-normal"> / {FREE_TIER_BRAND_LIMIT}</span>}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{isPaid ? 'Unlimited' : 'Free tier cap'}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-4 col-span-2 md:col-span-1">
            <p className="eyebrow mb-1.5">Member since</p>
            <p className="text-lg font-bold text-white leading-tight">{memberSince}</p>
          </div>
        </div>
      </StaggerItem>

      {/* Plan card — what unlocks, what to upgrade to */}
      <StaggerItem>
        <section className="relative rounded-2xl border border-zinc-800/70 bg-zinc-900/40 overflow-hidden p-5 md:p-6 mb-6">
          {!isPaid && (
            <div className="aurora-glow w-[400px] h-[260px] bg-blue-600/12 top-[-60px] right-[-60px]" style={{ animationDelay: '0s' }} />
          )}
          <div className="relative flex flex-col gap-3">
            <div>
              <p className="eyebrow mb-2 inline-flex items-center gap-1.5">
                <Sparkles size={10} /> Current plan
              </p>
              <h3 className="text-xl font-bold text-white leading-tight">
                {TIER_LABEL[tier] ?? 'Free'}{TIER_SUFFIX[tier] && <span className="text-zinc-500 font-normal text-sm ml-2">· {TIER_SUFFIX[tier]}</span>}
              </h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed max-w-lg">{TIER_BLURB[tier]}</p>
            </div>
            {!isPaid && (
              <a href="/pricing" className="btn btn-primary self-start mt-2">
                See plans <ArrowRight size={15} />
              </a>
            )}
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <a
          href="/account/brands"
          className="group flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-600 p-5 mb-6 transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <FolderOpen size={18} className="text-zinc-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Your library</p>
              <p className="text-xs text-zinc-500 mt-0.5">{brandCount === 0 ? 'Empty — generate your first brand' : `${brandCount} brand${brandCount === 1 ? '' : 's'} saved`}</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-zinc-500 group-hover:text-white transition-colors shrink-0" />
        </a>
      </StaggerItem>

      <StaggerItem>
        <RestorePurchasesButton />
      </StaggerItem>

      {waitlists.length > 0 && (
        <StaggerItem>
          <section className="mb-6">
            <p className="eyebrow mb-2">Waitlist signups</p>
            <ul className="space-y-1">
              {waitlists.map((p) => (
                <li key={p} className="text-sm text-zinc-300 capitalize">{p} — joined</li>
              ))}
            </ul>
          </section>
        </StaggerItem>
      )}
    </StaggerChildren>
  )
}
