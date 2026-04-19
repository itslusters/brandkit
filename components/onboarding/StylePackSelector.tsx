'use client'
import { motion } from 'framer-motion'
import { STYLE_PACKS, type StylePack } from '@/lib/style-packs'

interface Props {
  selected: string | null
  onSelect: (pack: StylePack) => void
}

/**
 * Horizontal-scroll style pack carousel. Each card carries the pack's
 * accent color as a tinted chip plus its fontHint ("Aa", "01", etc.)
 * rendered in display scale so users see the pack's personality at a
 * glance rather than parsing a text description.
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
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              className={`relative flex-shrink-0 snap-start w-32 rounded-2xl border overflow-hidden text-left transition-all ${
                isSelected
                  ? 'border-white bg-zinc-900 shadow-lg shadow-black/40'
                  : 'border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-600'
              }`}
              aria-pressed={isSelected}
            >
              {/* Accent preview header — carries the pack's signature color */}
              <div
                className="h-16 flex items-center justify-center relative"
                style={{ backgroundColor: pack.accentColor }}
              >
                <span
                  className="text-2xl font-bold text-white leading-none drop-shadow-sm"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {pack.fontHint}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-white">{pack.name}</p>
                <p className="text-[10px] text-zinc-500 leading-tight mt-1 line-clamp-2">{pack.description}</p>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="style-ring"
                  className="absolute inset-0 rounded-2xl border-2 border-white pointer-events-none"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
