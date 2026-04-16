'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { MockupTemplate } from '@/lib/types'

interface Props {
  template: MockupTemplate
  selected: boolean
  recommended: boolean
  onToggle: () => void
}

export function MockupTemplateCard({ template, selected, recommended, onToggle }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className="relative aspect-square rounded-xl overflow-hidden w-full bg-zinc-900 border border-zinc-800 text-left cursor-pointer"
    >
      <img src={template.image} alt={template.name} className="w-full h-3/5 object-cover bg-zinc-800" />
      <div className="p-3">
        <p className="text-sm font-semibold text-white">{template.name}</p>
        <p className="text-xs text-zinc-500 capitalize">{template.category}</p>
      </div>
      {recommended && (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-black">
          Recommended
        </span>
      )}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="ring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-xl border-[3px] border-white pointer-events-none"
            />
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center pointer-events-none shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-black">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
