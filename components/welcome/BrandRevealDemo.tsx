'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Before→after "brand reveal" hook — the shareable moment on welcome screen 1.
 * A typed name cross-fades into a finished brand card. Self-contained: no
 * network, bundled demo assets. (Visual co-designed against the dev server.)
 */
export function BrandRevealDemo() {
  const [after, setAfter] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setAfter((v) => !v), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-900">
      <AnimatePresence mode="wait">
        {!after ? (
          <motion.span
            key="before"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="font-mono text-lg text-zinc-500"
          >
            acme
          </motion.span>
        ) : (
          <motion.div
            key="after"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-2xl font-semibold tracking-tight text-white">Acme</span>
            <div className="flex gap-1.5">
              {['#1A1A2E', '#16213E', '#E94560'].map((c) => (
                <span key={c} className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
