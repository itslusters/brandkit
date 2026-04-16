'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative py-12 md:py-20">
      {/* Bayer-dithered hero background */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-zinc-800 bg-black">
        <img
          src="/landing/hero.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        {/* Gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        {/* Text overlay (top-left, like the reference) */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              From company info to a complete brand kit in minutes.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-md">
              AI-generated naming, logos, mockups, and brand guide. Designer-polished tier available.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <a
              href="/brand/new"
              className="inline-flex items-center justify-center bg-white text-zinc-950 px-5 py-2.5 rounded-md font-medium hover:bg-zinc-200 transition-colors"
            >
              Try free →
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center border border-zinc-600 bg-zinc-950/50 backdrop-blur-sm text-white px-5 py-2.5 rounded-md font-medium hover:border-zinc-400 transition-colors"
            >
              See pricing
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
