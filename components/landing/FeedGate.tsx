'use client'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface Props {
  totalCount: number
}

// Savee-style scroll gate — blurred gradient overlay at the bottom of the feed.
// Blocks further scrolling with an upgrade/signup CTA.
export function FeedGate({ totalCount }: Props) {
  return (
    <div className="relative mt-[-200px] pt-[200px]">
      {/* Gradient fade into the gate */}
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none" />

      <div className="relative bg-zinc-950 py-20 px-6">
        {/* Decorative image strip — blurred preview of what's behind the gate */}
        <div className="flex justify-center gap-2 mb-12 overflow-hidden max-w-3xl mx-auto opacity-40">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-24 h-32 rounded-xl bg-zinc-800 shrink-0"
              style={{
                transform: `rotate(${(i - 3) * 3}deg)`,
                opacity: 1 - Math.abs(i - 3) * 0.15,
              }}
            />
          ))}
        </div>

        <div className="text-center max-w-lg mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-white mb-3"
          >
            Upgrade and keep scrolling
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm text-zinc-400 mb-8 leading-relaxed"
          >
            Unlimited brand inspiration and downloads await. Create your first kit for free.
          </motion.p>

          {/* What's included */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-2 gap-x-8 gap-y-2 text-left text-xs text-zinc-400 mb-10 max-w-sm mx-auto"
          >
            {[
              'AI brand brief',
              'Vector SVG logo',
              '3 logo variants',
              'PDF brand guide',
              '9 product mockups',
              'Asset pack ZIP',
              'Brand presentation cards',
              'Unlimited inspiration',
            ].map((f) => (
              <div key={f} className="flex items-center gap-1.5">
                <Sparkles size={10} className="text-zinc-600 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a
              href="/brand/new"
              className="inline-flex items-center justify-center bg-white text-zinc-950 px-8 py-3.5 rounded-full font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
            >
              Create your brand
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center border border-zinc-700 text-zinc-300 px-8 py-3.5 rounded-full font-medium hover:border-zinc-500 transition-colors"
            >
              See pricing
            </a>
          </motion.div>

          {totalCount > 0 && (
            <p className="text-xs text-zinc-600 mt-6">
              {totalCount.toLocaleString()} brands created so far
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
