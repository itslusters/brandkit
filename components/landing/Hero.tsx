'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

/**
 * Landing hero — editorial stance rather than a head-to-head comparison.
 * Lets the brand itself do the positioning work; the feature list proves
 * the "full system" claim without having to call out competitors by name.
 */
const FEATURES = [
  'AI brand brief + naming',
  'Vector SVG logo',
  '3 logo variants',
  'PDF brand guide',
  '9 product mockups',
  'Asset pack ZIP',
  'Brand memory (saved)',
  'Designer handoff path',
]

export function Hero() {
  return (
    <section className="relative px-4 pt-14 pb-14 md:pt-24 md:pb-20">
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-6"
        >
          Brand workspace
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.02] mb-6"
        >
          Give your brand<br />a home.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base md:text-xl text-zinc-400 max-w-xl leading-relaxed mb-10"
        >
          Ten minutes to the first draft. Saved forever. Evolving with every
          launch, every campaign, every season.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-16"
        >
          <Link
            href="/brand/new"
            className="inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-7 py-4 rounded-full font-semibold text-base hover:bg-zinc-200 transition-colors shadow-xl shadow-white/10"
          >
            Start building — free <ArrowRight size={16} />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 border border-zinc-700 text-zinc-200 px-7 py-4 rounded-full font-medium text-base hover:border-zinc-500 transition-colors"
          >
            See plans
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-t border-zinc-800/60 pt-10"
        >
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-5">
            What you get on day one
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-200">
                <span className="text-blue-400 mt-0.5" aria-hidden>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
