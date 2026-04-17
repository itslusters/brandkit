'use client'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Props {
  open: boolean
  brandName: string
  onConfirm: () => void
  onClose: () => void
}

export function DeleteConfirmModal({ open, brandName, onConfirm, onClose }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold text-white mb-1">Delete brand?</h2>
      <p className="text-sm text-zinc-400 mb-5">
        <span className="text-white font-medium">{brandName}</span> will be permanently removed. This can&apos;t be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-200 hover:border-zinc-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </BottomSheet>
  )
}
