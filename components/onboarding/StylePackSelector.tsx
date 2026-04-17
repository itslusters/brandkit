'use client'
import { motion } from 'framer-motion'
import { STYLE_PACKS, type StylePack } from '@/lib/style-packs'

interface Props {
  selected: string | null
  onSelect: (pack: StylePack) => void
}

export function StylePackSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-1">
        Style direction <span className="text-zinc-600">(optional)</span>
      </label>
      <p className="text-xs text-zinc-600 mb-3">
        Pick a visual direction — we&apos;ll match naming, palette, and logo.
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {STYLE_PACKS.map((pack) => {
          const isSelected = selected === pack.id
          return (
            <motion.button
              key={pack.id}
              type="button"
              onClick={() => onSelect(pack)}
              whileTap={{ scale: 0.96 }}
              className={`relative flex-shrink-0 snap-start w-28 rounded-xl border p-3 text-left transition-colors ${
                isSelected
                  ? 'border-white bg-zinc-900'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
              }`}
            >
              {/* Color accent + font hint */}
              <div
                className="w-full aspect-[4/3] rounded-lg mb-2 flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: `${pack.accentColor}18`, color: pack.accentColor }}
              >
                {pack.fontHint}
              </div>
              <p className="text-xs font-semibold text-white truncate">{pack.name}</p>
              <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 line-clamp-2">{pack.description}</p>

              {isSelected && (
                <motion.div
                  layoutId="style-ring"
                  className="absolute inset-0 rounded-xl border-2 border-white pointer-events-none"
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
