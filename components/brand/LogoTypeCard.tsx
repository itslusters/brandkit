'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { LogoType } from '@/lib/types'

interface Props {
  type: LogoType
  label: string
  description: string
  selected: boolean
  onSelect: () => void
}

/**
 * Logo-type picker card. Simple radio-style card with label + description.
 * Schematic illustrations were removed — they read as AI-generated clip-art
 * more than they helped users decide.
 */
export function LogoTypeCard({ label, description, selected, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative w-full text-left rounded-xl border p-4 transition-all ${
        selected
          ? 'border-white/30 bg-zinc-900'
          : 'border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-700'
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">{label}</p>
          <p className="text-xs text-zinc-500 mt-1 leading-snug">{description}</p>
        </div>
        <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          selected ? 'bg-white' : 'border border-zinc-700'
        }`}>
          {selected && <Check size={11} className="text-black" strokeWidth={3} />}
        </div>
      </div>
    </motion.button>
  )
}
