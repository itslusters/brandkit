'use client'
import { motion } from 'framer-motion'

interface Props {
  totalCount: number
}

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

/**
 * End-of-feed close. Visitors scroll the gallery first (visual hook), and
 * this block catches them at the bottom with the actual positioning: "Give
 * your brand a home." + what you get on day one + one clear CTA. The pitch
 * lives here rather than up top so the feed does the attention-grabbing
 * work and the pitch arrives once curiosity is warm.
 */
export function FeedGate({ totalCount }: Props) {
  return (
    <div className="relative mt-[-200px] pt-[200px]">
      {/* Gradient fade from feed into gate */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none" />

      <div className="relative bg-zinc-950">
        {/* Animated aurora gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="aurora-glow w-[600px] h-[400px] bg-blue-600/20 top-[20%] left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="aurora-glow w-[500px] h-[400px] bg-violet-600/15 top-[30%] right-[5%]" style={{ animationDelay: '2s' }} />
          <div className="aurora-glow w-[400px] h-[300px] bg-indigo-500/10 bottom-[10%] left-[30%]" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-5"
            >
              Brand workspace
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.02] mb-5"
            >
              Give your brand<br />a home.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base md:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed mb-10"
            >
              Ten minutes to the first draft. Saved forever. Evolving with every
              launch, every campaign, every season.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mb-10"
            >
              <a
                href="/brand/new"
                className="inline-flex items-center justify-center bg-white text-zinc-950 px-10 py-4 rounded-full font-semibold text-base hover:bg-zinc-200 transition-colors shadow-xl shadow-white/10"
              >
                Start building — free
              </a>
              {totalCount > 0 && (
                <p className="text-xs text-zinc-600 mt-5">
                  {totalCount.toLocaleString()} brands created
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-t border-zinc-800/60 pt-8 max-w-xl mx-auto"
            >
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-5">
                What you get on day one
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-left">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-200">
                    <span className="text-blue-400 mt-0.5" aria-hidden>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative border-t border-zinc-800/40 py-6 px-6">
          <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
            <div className="flex gap-4 flex-wrap">
              <a href="/company" className="hover:text-zinc-300 transition-colors">About</a>
              <a href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
              <a href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-zinc-300 transition-colors">Terms</a>
              <a href="mailto:we.lusters@gmail.com" className="hover:text-zinc-300 transition-colors">Contact</a>
            </div>
            <span>© 2026 Kiln</span>
          </div>
        </div>
      </div>
    </div>
  )
}
