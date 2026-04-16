'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'

interface Props {
  state: 'idle' | 'saving' | 'saved' | 'limit' | 'error'
  message?: string
}

export function SavedBadge({ state, message }: Props) {
  if (state === 'idle') return null

  const config = {
    saving:  { icon: null, label: 'Saving…', cls: 'border-zinc-700 text-zinc-300' },
    saved:   { icon: <Check size={14} />, label: 'Saved to library', cls: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/5' },
    limit:   { icon: <AlertCircle size={14} />, label: message ?? 'Library limit reached', cls: 'border-amber-500/40 text-amber-300 bg-amber-500/5' },
    error:   { icon: <AlertCircle size={14} />, label: message ?? 'Save failed', cls: 'border-red-500/40 text-red-300 bg-red-500/5' },
  }[state]

  return (
    <AnimatePresence>
      <motion.div
        key={state}
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${config.cls}`}
      >
        {config.icon}
        <span>{config.label}</span>
      </motion.div>
    </AnimatePresence>
  )
}
