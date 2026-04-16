'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { LogoTypeCard } from '@/components/brand/LogoTypeCard'
import { EmailGateModal } from '@/components/brand/EmailGateModal'
import { getSession, setSession } from '@/lib/session'
import type { BrandResult, LogoType } from '@/lib/types'

const LOGO_TYPES: { type: LogoType; label: string; description: string }[] = [
  {
    type: 'wordmark',
    label: 'Wordmark',
    description: 'Brand name expressed through typography',
  },
  {
    type: 'symbol-text',
    label: 'Symbol + Text',
    description: 'Icon paired with the brand name',
  },
  {
    type: 'emblem',
    label: 'Emblem',
    description: 'Name enclosed in a badge or shield',
  },
]

export default function LogoTypePage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<LogoType | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const r = getSession<BrandResult>('brandResult')
    const name = getSession<string>('selectedName')
    if (!r || !name) { router.replace('/brand/new'); return }
    setReady(true)
  }, [router])

  function confirm() {
    if (!selected) return
    setSession('logoType', selected)
    const alreadyCaptured = getSession<boolean>('emailCaptured')
    const isAuthEmail = isLoaded && isSignedIn && !!user?.primaryEmailAddress?.emailAddress
    if (alreadyCaptured || isAuthEmail) {
      if (isAuthEmail) {
        setSession('emailCaptured', true)
      }
      router.push('/brand/logo/studio')
    } else {
      setModalOpen(true)
    }
  }

  async function handleEmailSubmit(email: string) {
    const brandName = getSession<string>('selectedName') ?? 'unknown'
    const res = await fetch('/api/brand/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, brandName }),
    })
    if (res.status === 429) throw new Error('daily_limit')
    if (!res.ok) throw new Error('network')
    setSession('emailCaptured', true)
    setModalOpen(false)
    router.push('/brand/logo/studio')
  }

  if (!ready) return null

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Choose logo style</h1>
        <p className="text-zinc-500 text-sm mt-1">What type of logo do you want?</p>
      </div>

      <div className="space-y-3">
        {LOGO_TYPES.map((item, i) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <LogoTypeCard
              type={item.type}
              label={item.label}
              description={item.description}
              selected={selected === item.type}
              onSelect={() => setSelected(item.type)}
            />
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={confirm}
        disabled={!selected}
        className="mt-8 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Create logo →
      </button>

      <EmailGateModal
        open={modalOpen}
        onSubmit={handleEmailSubmit}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
