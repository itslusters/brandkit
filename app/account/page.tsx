import { auth, currentUser } from '@clerk/nextjs/server'
import { getUserTier } from '@/lib/tier'
import { getWaitlistFor } from '@/lib/waitlist'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const tier = await getUserTier()
  const waitlists = email ? await getWaitlistFor(email) : []

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Account</h1>
      </div>

      <section className="mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Logged in as</p>
        <p className="text-base text-white">{email}</p>
      </section>

      <section className="mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current plan</p>
        <p className="text-base text-white capitalize">{tier}</p>
      </section>

      <section className="mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Library</p>
        <a
          href="/account/brands"
          className="inline-block text-sm text-zinc-300 hover:text-white underline"
        >
          Your saved brands →
        </a>
      </section>

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
    </div>
  )
}
