'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { STYLE_PACKS, type StylePack } from '@/lib/style-packs'

interface Props {
  selected: string | null
  onSelect: (pack: StylePack) => void
}

/**
 * Horizontal-scroll style pack picker. Just name + description per card —
 * large font-hint letters were removed as they read as abstract/decorative
 * rather than informative.
 */
export function StylePackSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-1">
        Style direction <span className="text-zinc-600">(optional)</span>
      </label>
      <p className="text-xs text-zinc-500 mb-3">
        Pick a visual direction — we&apos;ll match naming, palette, and logo.
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
        {STYLE_PACKS.map((pack) => {
          const isSelected = selected === pack.id
          return (
            <motion.button
              key={pack.id}
              type="button"
              onClick={() => onSelect(pack)}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className={`relative flex-shrink-0 snap-start w-36 rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? 'border-white/30 bg-zinc-900'
                  : 'border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-700'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white">{pack.name}</p>
                {isSelected && (
                  <div className="shrink-0 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <Check size={9} className="text-black" strokeWidth={3} />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 leading-snug mt-1 line-clamp-2">{pack.description}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
