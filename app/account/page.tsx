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

export default async function AccountPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const tier = await getUserTier()
  const waitlists = email ? await getWaitlistFor(email) : []
  const sp = await searchParams
  const upgradeSuccess = sp.upgrade === 'success' && (sp.plan === 'essentials' || sp.plan === 'pro')

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
          <p className="text-base text-white capitalize">{tier}</p>
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
