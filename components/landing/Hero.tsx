'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

/**
 * Landing hero — the first thing visitors see. Positioned against generic AI
 * tools (ChatGPT, Gemini, Claude, Lovable) by emphasizing Kiln as the *home*
 * for a brand, not another on-demand generator. The left column carries the
 * message; the right column is a quiet comparison ladder that does the
 * differentiation work without reading as a sales table.
 */
export function Hero() {
  return (
    <section className="relative px-4 pt-10 pb-16 md:pt-20 md:pb-24">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-5"
        >
          Brand workspace, not another logo generator
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5"
        >
          ChatGPT gives you <span className="text-zinc-500">a logo.</span>
          <br />
          Kiln gives you <span className="text-white">a brand.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed mb-8"
        >
          Any AI can spit out a logo now. Only Kiln remembers your brand, ships you
          a vector SVG, composes mockups, and hands off to a real designer when
          the stakes are high.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col sm:flex-row gap-3 mb-14"
        >
          <Link
            href="/brand/new"
            className="inline-flex items-center justify-center gap-2 bg-white text-zinc-950 px-6 py-3.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-xl shadow-white/10"
          >
            Build my brand <ArrowRight size={16} />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center gap-2 border border-zinc-700 text-zinc-200 px-6 py-3.5 rounded-full font-medium text-sm hover:border-zinc-500 transition-colors"
          >
            See plans
          </Link>
        </motion.div>

        {/* Differentiators — the comparison ladder. Kept small so it reads as
            "here's why we exist" rather than a hard sell. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 max-w-3xl border-t border-zinc-800/60 pt-8"
        >
          {[
            { title: 'Brand memory', body: 'Your DNA — colors, type, style — is saved. Next request builds on it.' },
            { title: 'Full system', body: 'Logo, palette, mockups, PDF guide, SVG vector. Not one PNG.' },
            { title: 'Designer handoff', body: 'Pro and Studio tiers route to a real designer in 2–3 days.' },
            { title: 'Brand evolution', body: 'Seasonal marks, sub-brands, campaign variants from the same root.' },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-xs font-semibold text-white mb-1.5">{item.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
