'use client'
import { motion } from 'framer-motion'

interface Props {
  totalCount: number
}

/**
 * End-of-feed close-out. The detailed pitch + feature list lives in the
 * Hero now, so this block is intentionally minimal — it just catches
 * visitors who scrolled the whole gallery and gives them one clear action
 * plus a quiet social-proof number.
 */
export function FeedGate({ totalCount }: Props) {
  return (
    <div className="relative mt-[-200px] pt-[200px]">
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none" />

      <div className="relative bg-zinc-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="aurora-glow w-[600px] h-[400px] bg-blue-600/15 top-[30%] left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="aurora-glow w-[500px] h-[400px] bg-violet-600/10 top-[40%] right-[5%]" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative py-20 px-6">
          <div className="text-center max-w-md mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold text-white mb-4"
            >
              Your brand is waiting.
            </motion.h2>

            <motion.a
              href="/brand/new"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center justify-center bg-white text-zinc-950 px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-xl shadow-white/10"
            >
              Start building — free
            </motion.a>

            {totalCount > 0 && (
              <p className="text-xs text-zinc-600 mt-5">
                {totalCount.toLocaleString()} brands created
              </p>
            )}
          </div>
        </div>

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
