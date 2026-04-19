'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'

interface Props {
  state: 'skeleton' | 'result' | 'error'
  dataUrl?: string
  templateName: string
  onDownload?: () => void
  errorMessage?: string
  /** When true, surfaces a "Watermarked" badge so free users understand why
   *  the PNG has a Atriium mark before they try to download. */
  watermarked?: boolean
}

export function MockupResultCard({ state, dataUrl, templateName, onDownload, errorMessage, watermarked }: Props) {
  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
      <AnimatePresence mode="wait">
        {state === 'skeleton' && (
          <motion.div
            key="skeleton"
            className="absolute inset-0 bg-zinc-900 dot-grid-card"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
        )}
        {state === 'result' && dataUrl && (
          <motion.img
            key="result"
            src={dataUrl}
            alt={templateName}
            initial={{ opacity: 0, filter: 'blur(16px)', scale: 1.04 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 28 }}
            className="w-full h-full object-contain"
          />
        )}
        {state === 'error' && (
          <div key="error" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-zinc-900 p-4 text-center">
            <p className="text-xs text-red-300 font-medium">Failed to generate</p>
            {errorMessage && (
              <p className="text-[10px] text-zinc-500 line-clamp-4 break-words font-mono">{errorMessage}</p>
            )}
          </div>
        )}
      </AnimatePresence>
      {state === 'result' && watermarked && (
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white/90">
          <Lock size={10} /> Watermarked
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between">
        <span className="text-xs text-white font-medium">{templateName}</span>
        {state === 'result' && onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="text-xs text-white underline decoration-zinc-400"
          >
            PNG
          </button>
        )}
      </div>
    </div>
  )
}
