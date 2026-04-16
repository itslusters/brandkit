'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    // Full-bleed: escape parent's max-w + horizontal padding using viewport-width breakout.
    // -mx-4 cancels the parent <main> px-4 on mobile; on md+ the breakout extends to full viewport.
    <section className="relative -mx-4 md:left-1/2 md:-translate-x-1/2 md:w-screen">
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-black">
        <img
          src="/landing/hero.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Vignette + bottom darken so text reads over any dither variance */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 pb-10 sm:pb-14">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]"
            >
              From company info<br />to a complete brand kit<br />in minutes.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mt-4 text-sm sm:text-base text-zinc-300 max-w-md"
            >
              AI-generated naming, logos, mockups, and brand guide. Designer-polished tier available.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="mt-6 flex flex-col sm:flex-row gap-3"
            >
              <a
                href="/brand/new"
                className="inline-flex items-center justify-center bg-white text-zinc-950 px-5 py-3 rounded-md font-medium hover:bg-zinc-200 transition-colors"
              >
                Try free →
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center justify-center border border-zinc-500 bg-black/40 backdrop-blur-sm text-white px-5 py-3 rounded-md font-medium hover:border-zinc-300 transition-colors"
              >
                See pricing
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
