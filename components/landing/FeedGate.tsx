'use client'
import { motion } from 'framer-motion'

interface Props {
  totalCount: number
}

const FREE_FEATURES = [
  'AI brand brief + naming',
  '3 logo variants',
  'Clean PNG logo',
  'A/B polls',
  'Up to 3 brands saved',
]

const PAID_FEATURES = [
  '9 photorealistic mockups',
  'Vector SVG logo',
  'PDF brand guide + asset ZIP',
  'Unlimited brands',
  'Designer-polished logo',
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
              className="eyebrow mb-5"
            >
              Brand workspace
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="display-2 text-white mb-5"
            >
              One brand. Every channel.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed mb-10"
            >
              Atriium builds your brand once and stretches it across every
              surface you need — app icons, thumbnails, mockups, social posts.
              Vector SVG + full commercial rights included.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mb-10"
            >
              <a href="/brand/new" className="btn btn-primary btn-lg">
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
              className="border-t border-zinc-800/60 pt-8 max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 text-left"
            >
              <div>
                <p className="eyebrow mb-4">Free, day one</p>
                <ul className="space-y-2.5">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-200">
                      <span className="text-blue-400 mt-0.5" aria-hidden>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-4">Unlocks with paid</p>
                <ul className="space-y-2.5">
                  {PAID_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <span className="text-zinc-500 mt-0.5" aria-hidden>+</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
            <span>© 2026 Atriium</span>
          </div>
        </div>
      </div>
    </div>
  )
}
