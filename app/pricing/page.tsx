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
import { trackEvent } from '@/lib/analytics'
import type { PaidPlan } from '@/lib/tier'

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
  const [waitlistPlan, setWaitlistPlan] = useState<'essentials' | 'pro' | null>(null)

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
    trackEvent('paid_checkout_start', { plan, surface: 'ios' })
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

  function handleBuy(plan: PaidPlan) {
    if (native) {
      void buyOnIos(plan)
    } else {
      // Web has no payment rail; route to waitlist so we can notify on iOS launch.
      const onetime: 'essentials' | 'pro' | null =
        plan === 'essentials' ? 'essentials' : plan === 'pro' ? 'pro' : null
      setWaitlistPlan(onetime ?? 'essentials')
    }
  }

  return (
    <StaggerChildren className="pt-4 pb-12">
      <StaggerItem>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">Pricing</h1>
          <p className="text-zinc-500 text-sm mt-2 max-w-xl leading-relaxed">
            Free gets you the brief, logo variants, and a clean PNG. Paid unlocks what creators actually need long-term: vector SVG, multi-channel mockups, brand guide, unlimited brands, and full commercial rights.
          </p>
        </div>
      </StaggerItem>

      {!native && (
        <StaggerItem>
          <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-start gap-3">
            <Apple size={18} className="text-zinc-300 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Paid plans live in the iOS app</p>
              <p className="text-xs text-zinc-500 mt-1">
                Download Atriium on the App Store to subscribe or make a one-time purchase. Free tier works fine on the web.
              </p>
            </div>
          </div>
        </StaggerItem>
      )}

      {/* Subscription — the main product */}
      <StaggerItem>
        <p className="text-xs text-zinc-500 mb-3">Keep your brand alive</p>
        <div className="grid gap-4 md:grid-cols-3">
          <PricingCard
            name="Free"
            price="$0"
            priceSuffix=""
            features={[
              'AI brand brief + naming',
              'Logo generation (3 variants)',
              'Clean PNG logo download',
              'Brand A/B polls',
              'Up to 3 brands saved',
            ]}
            ctaLabel="Get started"
            onCtaClick={() => router.push('/brand/new')}
            highlighted={false}
          />
          <PricingCard
            name="Solo"
            price="$19"
            priceSuffix="/month"
            features={[
              'Everything in Free',
              'Your brand remembered forever',
              'Unlimited regenerations',
              'Clean PNG + vector SVG',
              'PDF brand guide + asset ZIP',
              'New mockup templates monthly',
              'Brand A/B polls',
            ]}
            ctaLabel={busyPlan === 'solo' ? 'Starting…' : native ? 'Subscribe in app' : 'Get on App Store'}
            onCtaClick={() => handleBuy('solo')}
            highlighted={true}
          />
          <PricingCard
            name="Studio"
            price="$79"
            priceSuffix="/month"
            features={[
              'Everything in Solo',
              '1 designer polish / month',
              'Custom-trained brand style',
              'Priority generation queue',
              'Multi-brand workspace',
            ]}
            ctaLabel={busyPlan === 'studio' ? 'Starting…' : native ? 'Subscribe in app' : 'Get on App Store'}
            onCtaClick={() => handleBuy('studio')}
            highlighted={false}
          />
        </div>
      </StaggerItem>

      {/* One-time — entry ramp for users who don't want to subscribe yet */}
      <StaggerItem>
        <div className="mt-10">
          <p className="text-xs text-zinc-500 mb-3">Or pay once</p>
          <div className="grid gap-4 md:grid-cols-2">
            <PricingCard
              name="Essentials"
              price="$29"
              priceSuffix="one-time"
              features={[
                'Clean PNG + vector SVG',
                '9 product mockups',
                'PDF brand guide',
                'Asset Pack ZIP',
                'One brand saved forever',
              ]}
              ctaLabel={busyPlan === 'essentials' ? 'Starting…' : native ? 'Buy in app' : 'Get on App Store'}
              onCtaClick={() => handleBuy('essentials')}
              highlighted={false}
            />
            <PricingCard
              name="Pro"
              price="$149"
              priceSuffix="one-time"
              features={[
                'Everything in Essentials',
                'Designer hand-polished logo',
                '1 revision included',
                'Delivered in 2–3 days',
              ]}
              ctaLabel={busyPlan === 'pro' ? 'Starting…' : native ? 'Buy in app' : 'Join waitlist'}
              onCtaClick={() => native ? handleBuy('pro') : setWaitlistPlan('pro')}
              highlighted={false}
            />
          </div>
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
