'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  state: 'skeleton' | 'result' | 'error'
  dataUrl?: string
  errorMessage?: string
  selected: boolean
  dimmed?: boolean
  recommended?: boolean
  onSelect: () => void
}

export function LogoResultCard({ state, dataUrl, errorMessage, selected, dimmed = false, recommended = false, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      onClick={() => state === 'result' && onSelect()}
      disabled={state === 'skeleton'}
      whileTap={state === 'result' ? { scale: 0.97 } : undefined}
      animate={{ opacity: dimmed ? 0.4 : 1, scale: dimmed ? 0.96 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative aspect-square rounded-xl overflow-hidden w-full disabled:cursor-default cursor-pointer ${state === 'result' && recommended ? 'ai-border' : ''}`}
    >
      <div className="absolute inset-0 rounded-xl">
      <AnimatePresence mode="wait">
        {state === 'skeleton' && (
          <motion.div
            key="skeleton"
            className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-xl dot-grid-card"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          />
        )}
        {state === 'result' && (
          <motion.img
            key="result"
            role="img"
            src={dataUrl}
            alt="Generated logo"
            initial={{ opacity: 0, filter: 'blur(16px)', scale: 1.04 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 28 }}
            className="w-full h-full object-contain bg-white pointer-events-none"
          />
        )}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-zinc-900 border border-red-900/60 rounded-xl flex flex-col items-center justify-center gap-2 px-4 text-center"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
            </svg>
            <p className="text-[10px] text-red-300 font-medium">Generation failed</p>
            {errorMessage && (
              <p className="text-[9px] text-zinc-500 line-clamp-3 break-words">{errorMessage}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {state === 'result' && recommended && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/95 text-black shadow-lg shadow-black/30 pointer-events-none"
        >
          Recommended
        </motion.span>
      )}

      <AnimatePresence>
        {state === 'result' && selected && (
          <>
            <motion.div
              key="ring"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="absolute inset-0 rounded-xl border-[3px] border-white pointer-events-none"
            />
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center pointer-events-none shadow-lg shadow-black/40"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-black">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
