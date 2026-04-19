'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { PricingCard } from '@/components/PricingCard'
import { WaitlistModal } from '@/components/WaitlistModal'
import { StaggerChildren, StaggerItem } from '@/components/ui/StaggerChildren'
import { isNative } from '@/lib/native'
import { startIapPurchase } from '@/lib/iap'

type PaidPlan = 'essentials' | 'pro'

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingPageInner />
    </Suspense>
  )
}

function PricingPageInner() {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const search = useSearchParams()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  const [native, setNative] = useState(false)
  const [busyPlan, setBusyPlan] = useState<PaidPlan | null>(null)
  const [error, setError] = useState('')
  const [waitlistPlan, setWaitlistPlan] = useState<PaidPlan | null>(null)

  useEffect(() => {
    setNative(isNative())
  }, [])

  const wasCancelled = search.get('cancelled') === '1'

  async function startCheckout(plan: PaidPlan) {
    setError('')
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/pricing`)
      return
    }
    setBusyPlan(plan)
    try {
      if (native) {
        if (!user?.id) { setError('Sign-in required.'); return }
        const ok = await startIapPurchase(plan, user.id)
        if (ok) router.push(`/account?upgrade=success&plan=${plan}`)
        else setError('Purchase was not completed.')
        return
      }
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { message?: string }
        setError(j.message ?? 'Checkout failed. Please try again.')
        return
      }
      const { url } = await res.json() as { url?: string }
      if (url) {
        window.location.href = url
      } else {
        setError('Could not start checkout.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed.')
    } finally {
      setBusyPlan(null)
    }
  }

  return (
    <StaggerChildren className="pt-4 pb-12">
      <StaggerItem>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Pricing</h1>
          <p className="text-zinc-500 text-sm mt-1">Pay once. Get a complete brand kit.</p>
          {wasCancelled && (
            <p className="mt-3 text-xs text-zinc-400">Checkout cancelled. You can try again anytime.</p>
          )}
        </div>
      </StaggerItem>

      <StaggerItem>
      <div className="grid gap-4 md:grid-cols-3">
        <PricingCard
          name="Free"
          price="$0"
          priceSuffix=""
          features={['AI brand brief', 'Logo generation', '9 mockup previews', 'Watermarked PNG previews']}
          ctaLabel="Get started"
          onCtaClick={() => router.push('/brand/new')}
          highlighted={false}
        />
        <PricingCard
          name="Essentials"
          price="$29"
          priceSuffix="one-time"
          features={['Everything in Free', 'Full PNG downloads', 'Vector SVG logo', 'PDF brand guide', 'Asset Pack ZIP']}
          ctaLabel={busyPlan === 'essentials' ? 'Starting…' : 'Buy now'}
          onCtaClick={() => startCheckout('essentials')}
          highlighted={true}
        />
        <PricingCard
          name="Pro"
          price="$149"
          priceSuffix="one-time"
          features={['Everything in Essentials', 'Designer hand-polished logo', '1 revision included', 'Delivered in 2-3 days']}
          ctaLabel="Join waitlist"
          onCtaClick={() => setWaitlistPlan('pro')}
          highlighted={false}
        />
      </div>
      </StaggerItem>

      {error && (
        <StaggerItem>
          <p className="mt-4 text-xs text-red-400">{error}</p>
        </StaggerItem>
      )}

      <WaitlistModal
        open={waitlistPlan !== null}
        plan={waitlistPlan ?? 'essentials'}
        prefilledEmail={email}
        onClose={() => setWaitlistPlan(null)}
      />
    </StaggerChildren>
  )
}
