'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  reason: string
  onClose: () => void
  onChoosePlan: (plan: 'essentials' | 'pro') => void
}

export function UpgradeModal({ open, reason, onClose, onChoosePlan }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-6"
          >
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
