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

// Animated SVG previews — each visually demonstrates its logo type.
function WordmarkPreview({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 120 40" width="120" height="40" fill="none" aria-hidden="true">
      {/* Letter-by-letter reveal animation */}
      {'BRAND'.split('').map((char, i) => (
        <motion.text
          key={i}
          x={12 + i * 22}
          y="30"
          fontSize="28"
          fontWeight="800"
          fill="currentColor"
          fontFamily="sans-serif"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: active ? 1 : 0.5, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
        >
          {char}
        </motion.text>
      ))}
    </svg>
  )
}

function SymbolTextPreview({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 140 40" width="140" height="40" fill="none" aria-hidden="true">
      {/* Rotating geometric symbol */}
      <motion.g
        animate={active ? { rotate: [0, 90, 180, 270, 360] } : { rotate: 0 }}
        transition={active ? { duration: 8, repeat: Infinity, ease: 'linear' } : {}}
        style={{ transformOrigin: '20px 20px' }}
      >
        <rect x="8" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="20" r="6" fill="currentColor" opacity={0.3} />
      </motion.g>
      {/* Text beside */}
      <motion.text
        x="52"
        y="26"
        fontSize="18"
        fontWeight="700"
        fill="currentColor"
        fontFamily="sans-serif"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: active ? 1 : 0.5, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Brand
      </motion.text>
    </svg>
  )
}

function EmblemPreview({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 60 64" width="50" height="54" fill="none" aria-hidden="true">
      {/* Shield path — draws itself */}
      <motion.path
        d="M30 4L54 14V30C54 44 43 55 30 58C17 55 6 44 6 30V14L30 4Z"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: active ? 1 : 0.6 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
      <motion.text
        x="30"
        y="38"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="currentColor"
        fontFamily="sans-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0.4 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        B
      </motion.text>
    </svg>
  )
}

const PREVIEWS: Record<LogoType, (props: { active: boolean }) => React.ReactElement> = {
  'wordmark': WordmarkPreview,
  'symbol-text': SymbolTextPreview,
  'emblem': EmblemPreview,
}

export function LogoTypeCard({ type, label, description, selected, onSelect }: Props) {
  const Preview = PREVIEWS[type]

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
            <Preview active={selected} />
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
