'use client'
import { Trash2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Props {
  open: boolean
  brandName: string
  onConfirm: () => void
  onClose: () => void
  busy?: boolean
}

export function DeleteConfirmModal({ open, brandName, onConfirm, onClose, busy }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
        <Trash2 size={18} className="text-red-400" />
      </div>
      <p className="eyebrow mb-3">Delete brand</p>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight mb-2">
        Remove <span className="text-zinc-400">{brandName}</span>?
      </h2>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
        The brand, its logo, mockups, and brand memory will be permanently
        deleted. This cannot be undone.
      </p>
      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="btn btn-secondary btn-full sm:flex-1"
        >
          Keep it
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="btn btn-full sm:flex-1"
          style={{
            background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 10px 30px -10px rgba(239,68,68,0.45), 0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {busy ? 'Deleting…' : 'Delete forever'}
        </button>
      </div>
    </BottomSheet>
  )
}
