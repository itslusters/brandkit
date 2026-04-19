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
 * Logo-type preview card. Each type renders a structural illustration in
 * SVG so the user sees the *shape* of the decision they're making, not
 * just text. The illustrations are schematic — deliberately not trying to
 * look like a real logo — so they read as "what kind of layout" rather
 * than "what will the AI make."
 */
export function LogoTypeCard({ type, label, description, selected, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative w-full text-left rounded-2xl border overflow-hidden transition-all duration-200 ${
        selected
          ? 'border-white/30 bg-zinc-900 shadow-xl shadow-black/30'
          : 'border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
      }`}
      aria-pressed={selected}
    >
      {/* Preview surface — light chip that makes the schematic pop */}
      <div
        className={`aspect-[16/9] flex items-center justify-center transition-colors duration-200 ${
          selected ? 'bg-zinc-200' : 'bg-zinc-100'
        }`}
      >
        <TypeIllustration type={type} />
      </div>

      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-white leading-tight">{label}</p>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
        </div>

        <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
          selected ? 'bg-white' : 'border border-zinc-700'
        }`}>
          {selected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="inline-flex"
            >
              <Check size={11} className="text-black" strokeWidth={3} />
            </motion.span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

function TypeIllustration({ type }: { type: LogoType }) {
  if (type === 'wordmark') {
    return (
      <svg viewBox="0 0 240 60" className="w-[60%] max-w-[200px] h-auto">
        {/* Pure typographic bar — letterform silhouettes */}
        <g fill="#09090b">
          <rect x="0" y="8" width="36" height="44" rx="2" />
          <rect x="44" y="8" width="8" height="44" />
          <rect x="60" y="8" width="36" height="44" rx="18" />
          <rect x="104" y="8" width="28" height="44" rx="2" />
          <rect x="140" y="8" width="36" height="44" rx="2" />
          <rect x="184" y="8" width="28" height="44" rx="14" />
          <rect x="220" y="8" width="20" height="44" />
        </g>
      </svg>
    )
  }
  if (type === 'symbol-text') {
    return (
      <svg viewBox="0 0 240 60" className="w-[60%] max-w-[200px] h-auto">
        {/* Icon on the left, wordmark bar on the right */}
        <g fill="#09090b">
          {/* Abstract symbol */}
          <circle cx="30" cy="30" r="24" />
          <circle cx="30" cy="30" r="10" fill="#f4f4f5" />
          {/* Vertical divider whitespace */}
          {/* Text bars */}
          <rect x="76" y="18" width="32" height="10" rx="2" />
          <rect x="116" y="18" width="24" height="10" rx="2" />
          <rect x="148" y="18" width="40" height="10" rx="2" />
          <rect x="76" y="34" width="96" height="8" rx="2" fill="#52525b" />
        </g>
      </svg>
    )
  }
  // emblem
  return (
    <svg viewBox="0 0 240 80" className="w-[55%] max-w-[180px] h-auto">
      {/* Enclosed shield shape with content inside */}
      <g>
        <path
          d="M 40 8 L 200 8 A 8 8 0 0 1 208 16 L 208 48 Q 208 62 120 72 Q 32 62 32 48 L 32 16 A 8 8 0 0 1 40 8 Z"
          fill="none"
          stroke="#09090b"
          strokeWidth="3"
        />
        <rect x="76" y="28" width="88" height="8" rx="2" fill="#09090b" />
        <rect x="92" y="44" width="56" height="6" rx="2" fill="#52525b" />
      </g>
    </svg>
  )
}
