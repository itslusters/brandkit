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

function WordmarkIcon() {
  return (
    <svg viewBox="0 0 80 32" width="80" height="32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="78" height="30" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <text x="40" y="21" textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor" fontFamily="sans-serif">Aa</text>
    </svg>
  )
}

function SymbolTextIcon() {
  return (
    <svg viewBox="0 0 88 32" width="88" height="32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
      <text x="55" y="21" textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor" fontFamily="sans-serif">Aa</text>
    </svg>
  )
}

function EmblemIcon() {
  return (
    <svg viewBox="0 0 40 44" width="40" height="44" fill="none" aria-hidden="true">
      <path d="M20 2L37 10V22C37 31 29.5 39.5 20 42C10.5 39.5 3 31 3 22V10L20 2Z" stroke="currentColor" strokeWidth="1.5" />
      <text x="20" y="26" textAnchor="middle" fontSize="9" fontWeight="600" fill="currentColor" fontFamily="sans-serif">Aa</text>
    </svg>
  )
}

const ICONS: Record<LogoType, React.ReactNode> = {
  'wordmark': <WordmarkIcon />,
  'symbol-text': <SymbolTextIcon />,
  'emblem': <EmblemIcon />,
}

export function LogoTypeCard({ type, label, description, selected, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`w-full text-left rounded-xl border p-5 transition-colors duration-200 ${
        selected
          ? 'border-white bg-zinc-900'
          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white">{label}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
          <div className={`mt-3 ${selected ? 'text-white' : 'text-zinc-600'}`}>
            {ICONS[type]}
          </div>
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
