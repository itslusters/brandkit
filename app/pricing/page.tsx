'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { PricingCard } from '@/components/PricingCard'
import { WaitlistModal } from '@/components/WaitlistModal'
import { StaggerChildren, StaggerItem } from '@/components/ui/StaggerChildren'

export default function PricingPage() {
  const router = useRouter()
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  const [waitlistPlan, setWaitlistPlan] = useState<'essentials' | 'pro' | null>(null)

  return (
    <StaggerChildren className="pt-4 pb-12">
      <StaggerItem>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Pricing</h1>
          <p className="text-zinc-500 text-sm mt-1">Pay once. Get a complete brand kit.</p>
        </div>
      </StaggerItem>

      <StaggerItem>
      <div className="grid gap-4 md:grid-cols-3">
        <PricingCard
          name="Free"
          price="$0"
          priceSuffix=""
          features={['AI brand brief', '1 logo set', 'Watermarked PNG previews', '9 mockup templates']}
          ctaLabel="Get started"
          onCtaClick={() => router.push('/brand/new')}
          highlighted={false}
        />
        <PricingCard
          name="Essentials"
          price="$29"
          priceSuffix="one-time"
          features={['Everything in Free', 'Full PNG downloads', 'Vector SVG logo', 'PDF brand guide', 'Asset Pack ZIP']}
          ctaLabel="Join waitlist"
          onCtaClick={() => setWaitlistPlan('essentials')}
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

      <WaitlistModal
        open={waitlistPlan !== null}
        plan={waitlistPlan ?? 'essentials'}
        prefilledEmail={email}
        onClose={() => setWaitlistPlan(null)}
      />
    </StaggerChildren>
  )
}
