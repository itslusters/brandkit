'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandRevealDemo } from './BrandRevealDemo'

const SCREENS = [
  { key: 'hook', headline: 'Watch a name become a brand.', sub: 'Name, logo, palette, mockups — one flow.' },
  { key: 'industry', headline: 'Tuned to your industry.', sub: 'AI reads your category, so every result is its own.' },
  { key: 'ship', headline: 'Everything you need to launch.', sub: 'Vector logo, brand guide, mockups you can use today.' },
]

export function WelcomeScreens() {
  const [i, setI] = useState(0)
  const last = i === SCREENS.length - 1

  return (
    <div className="relative flex min-h-[80dvh] flex-col">
      <Link href="/brand/new" className="absolute right-0 top-0 text-sm text-zinc-400 hover:text-white">
        Skip
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        {i === 0 && <BrandRevealDemo />}
        <AnimatePresence mode="wait">
          <motion.div
            key={SCREENS[i].key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-3xl font-semibold tracking-tight">{SCREENS[i].headline}</h1>
            <p className="mt-3 text-zinc-400">{SCREENS[i].sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 py-4">
        {SCREENS.map((s, idx) => (
          <span key={s.key} className={`h-1.5 w-1.5 rounded-full ${idx === i ? 'bg-white' : 'bg-zinc-700'}`} />
        ))}
      </div>

      {last ? (
        <Link href="/brand/new" className="btn btn-primary w-full">Make yours →</Link>
      ) : (
        <button type="button" className="btn btn-primary w-full" onClick={() => setI(i + 1)}>Next</button>
      )}

      <Link href="/explore" className="mt-3 text-center text-sm text-zinc-400 hover:text-white">
        See examples →
      </Link>
    </div>
  )
}
