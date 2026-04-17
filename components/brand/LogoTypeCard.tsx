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

export function LogoTypeCard({ type, label, description, selected, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`w-full text-left rounded-2xl border p-5 transition-colors duration-200 card-elevated ${
        selected
          ? 'border-white/30 bg-zinc-900'
          : 'border-zinc-800/60 bg-zinc-950 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-white">{label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center"
          >
            <Check size={11} className="text-black" strokeWidth={3} />
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}
