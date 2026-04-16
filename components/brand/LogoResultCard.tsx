'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  state: 'skeleton' | 'result'
  dataUrl?: string
  selected: boolean
  onSelect: () => void
}

export function LogoResultCard({ state, dataUrl, selected, onSelect }: Props) {
  return (
    <div
      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
      onClick={() => state === 'result' && onSelect()}
    >
      <AnimatePresence mode="wait">
        {state === 'skeleton' ? (
          <motion.div
            key="skeleton"
            className="absolute inset-0 bg-zinc-800 rounded-xl"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
        ) : (
          <motion.img
            key="result"
            role="img"
            src={dataUrl}
            alt="Generated logo"
            initial={{ opacity: 0, filter: 'blur(16px)', scale: 1.04 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 28 }}
            className="w-full h-full object-contain bg-white"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === 'result' && selected && (
          <motion.div
            key="ring"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="absolute inset-0 rounded-xl border-2 border-white pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
