'use client'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Props {
  open: boolean
  reason: string
  onClose: () => void
  onChoosePlan: (plan: 'essentials' | 'pro') => void
}

export function UpgradeModal({ open, reason, onClose, onChoosePlan }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold text-white mb-1">Unlock full downloads</h2>
      <p className="text-sm text-zinc-400 mb-5">{reason}</p>
      <div className="space-y-2">
        <button
          onClick={() => onChoosePlan('essentials')}
          className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm text-left px-4 flex items-center justify-between"
        >
          <span>Essentials</span><span className="text-xs">$29 · join waitlist</span>
        </button>
        <button
          onClick={() => onChoosePlan('pro')}
          className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-200 font-semibold text-sm text-left px-4 flex items-center justify-between"
        >
          <span>Pro (designer-polished)</span><span className="text-xs">$149 · join waitlist</span>
        </button>
        <button onClick={onClose} className="w-full py-2 text-xs text-zinc-500 mt-2">Maybe later</button>
      </div>
    </BottomSheet>
  )
}
