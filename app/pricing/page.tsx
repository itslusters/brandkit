'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Apple } from 'lucide-react'
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
  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  const [native, setNative] = useState(false)
  const [busyPlan, setBusyPlan] = useState<PaidPlan | null>(null)
  const [error, setError] = useState('')
  const [waitlistPlan, setWaitlistPlan] = useState<PaidPlan | null>(null)

  useEffect(() => {
    setNative(isNative())
  }, [])

  async function buyOnIos(plan: PaidPlan) {
    setError('')
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/pricing`)
      return
    }
    if (!user?.id) { setError('Sign-in required.'); return }
    setBusyPlan(plan)
    try {
      const ok = await startIapPurchase(plan, user.id)
      if (ok) router.push(`/account?upgrade=success&plan=${plan}`)
      else setError('Purchase was not completed.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed.')
    } finally {
      setBusyPlan(null)
    }
  }

  // Payments are processed through the App Store (Apple IAP). Web users see
  // a download-the-app gate; iOS users get a real native purchase sheet.
  function handleBuy(plan: PaidPlan) {
    if (native) {
      void buyOnIos(plan)
    } else {
      // Web fallback — no Stripe. Route to waitlist so we can notify on launch.
      setWaitlistPlan(plan)
    }
  }

  return (
    <StaggerChildren className="pt-4 pb-12">
      <StaggerItem>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Pricing</h1>
          <p className="text-zinc-500 text-sm mt-1">Pay once. Get a complete brand kit.</p>
        </div>
      </StaggerItem>

      {!native && (
        <StaggerItem>
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-start gap-3">
            <Apple size={18} className="text-zinc-300 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Paid plans are purchased in the iOS app</p>
              <p className="text-xs text-zinc-500 mt-1">
                Download Kiln on the App Store to unlock Essentials or Pro. Free tier works fine on the web.
              </p>
            </div>
          </div>
        </StaggerItem>
      )}

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
          ctaLabel={busyPlan === 'essentials' ? 'Starting…' : native ? 'Buy in app' : 'Get on App Store'}
          onCtaClick={() => handleBuy('essentials')}
          highlighted={true}
        />
        <PricingCard
          name="Pro"
          price="$149"
          priceSuffix="one-time"
          features={['Everything in Essentials', 'Designer hand-polished logo', '1 revision included', 'Delivered in 2-3 days']}
          ctaLabel={busyPlan === 'pro' ? 'Starting…' : native ? 'Buy in app' : 'Join waitlist'}
          onCtaClick={() => native ? handleBuy('pro') : setWaitlistPlan('pro')}
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
