'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

// Mobile: slides up from bottom (modern app feel, drag handle visible).
// Desktop: centered dialog with spring entrance.
export function BottomSheet({ open, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex sm:items-center items-end justify-center"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-zinc-950 border border-zinc-800 border-b-0 sm:border-b p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center mb-3 -mt-1">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
