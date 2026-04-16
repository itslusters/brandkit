'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="py-12 md:py-20 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-4xl md:text-6xl font-bold tracking-tight text-white"
      >
        From company info to a complete brand kit in minutes.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="mt-5 text-base md:text-lg text-zinc-400 max-w-2xl mx-auto"
      >
        AI-generated naming, logos, mockups, and brand guide. Designer-polished tier available.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
      >
        <a
          href="/brand/new"
          className="inline-flex items-center justify-center bg-white text-zinc-950 px-5 py-2.5 rounded-md font-medium hover:bg-zinc-200 transition-colors"
        >
          Try free →
        </a>
        <a
          href="/pricing"
          className="inline-flex items-center justify-center border border-zinc-700 text-white px-5 py-2.5 rounded-md font-medium hover:border-zinc-500 transition-colors"
        >
          See pricing
        </a>
      </motion.div>
    </section>
  )
}
