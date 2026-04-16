'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  brandName: string
  onConfirm: () => void
  onClose: () => void
}

export function DeleteConfirmModal({ open, brandName, onConfirm, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-6"
          >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
