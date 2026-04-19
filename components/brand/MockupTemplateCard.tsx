'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import type { MockupTemplate } from '@/lib/types'

interface Props {
  template: MockupTemplate
  selected: boolean
  recommended: boolean
  onToggle: () => void
}

/**
 * Selection card for a mockup template. No preview image — the preview
 * PNGs felt low-quality and read as AI-generated placeholder content;
 * just the name + category + recommended badge reads cleaner.
 */
export function MockupTemplateCard({ template, selected, recommended, onToggle }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className={`relative w-full rounded-xl border p-4 text-left transition-colors ${
        selected
          ? 'border-white/30 bg-zinc-900'
          : 'border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-700'
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{template.name}</p>
          <p className="text-xs text-zinc-500 capitalize mt-0.5">{template.category}</p>
        </div>
        <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          selected ? 'bg-white' : 'border border-zinc-700'
        }`}>
          {selected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="inline-flex"
            >
              <Check size={11} className="text-black" strokeWidth={3} />
            </motion.span>
          )}
        </div>
      </div>
      <AnimatePresence>
        {recommended && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 inline-block text-[10px] font-semibold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-full"
          >
            Recommended
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
