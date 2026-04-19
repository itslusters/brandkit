'use client'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Props {
  open: boolean
  reason: string
  onClose: () => void
  /**
   * Retained so existing callers (mockup page, saved brand view) keep
   * working — it still routes one-time plans to the waitlist flow. The
   * primary CTA here now points at `/pricing` so users see the full
   * subscription + one-time ladder instead of being stuck in a 2-option
   * popup.
   */
  onChoosePlan: (plan: 'essentials' | 'pro') => void
}

export function UpgradeModal({ open, reason, onClose, onChoosePlan }: Props) {
  const router = useRouter()

  function seePlans() {
    onClose()
    router.push('/pricing')
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <p className="eyebrow mb-3 inline-flex items-center gap-1.5">
        <Sparkles size={11} /> Upgrade
      </p>
      <h2 className="display-2 text-white mb-3" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
        Unlock the full kit.
      </h2>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{reason}</p>

      <div className="space-y-3">
        <button type="button" onClick={seePlans} className="btn btn-primary btn-full">
          See all plans
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChoosePlan('essentials')}
            className="btn btn-secondary btn-full"
          >
            Essentials · $29
          </button>
          <button
            type="button"
            onClick={() => onChoosePlan('pro')}
            className="btn btn-secondary btn-full"
          >
            Pro · $149
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="block w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-2 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </BottomSheet>
  )
}
