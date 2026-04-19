'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StyleBrief } from '@/lib/types'

interface Props {
  brief: StyleBrief
}

/**
 * Brief "artifact" card set. The style brief is the moment the user first
 * sees their brand as a coherent system — not a form-response — so the
 * layout leans editorial: a large style label, a palette strip that shows
 * each swatch at scale with its hex inline, a typography specimen rendered
 * in a generous size, and an avoid callout framed as a side-note.
 */

function Swatch({ hex, index }: { hex: string; index: number }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }
  return (
    <motion.button
      type="button"
      onClick={copy}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 220, damping: 24 }}
      whileHover={{ y: -2 }}
      className="group relative rounded-xl overflow-hidden border border-white/5 aspect-[4/3] flex flex-col justify-end"
      style={{ backgroundColor: hex }}
      aria-label={`Copy ${hex}`}
    >
      <div className="relative p-3 bg-gradient-to-t from-black/40 to-transparent">
        <AnimatePresence mode="wait">
          <motion.span
            key={copied ? 'c' : 'h'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] font-medium tabular-nums text-white/90 drop-shadow"
          >
            {copied ? 'Copied' : hex.toUpperCase()}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.button>
  )
}

export function StyleBriefDisplay({ brief }: Props) {
  return (
    <div className="space-y-10">
      {/* Recommended style — the single line that summarizes everything */}
      <section>
        <p className="eyebrow mb-2">Style</p>
        <p className="text-2xl md:text-3xl font-semibold text-white leading-tight tracking-tight">
          {brief.recommendedStyle}
        </p>
      </section>

      {/* Palette strip */}
      <section>
        <p className="eyebrow mb-3">Palette</p>
        <div className="grid grid-cols-3 gap-2">
          {brief.colorPalette.map((hex, i) => (
            <Swatch key={`${hex}-${i}`} hex={hex} index={i} />
          ))}
        </div>
      </section>

      {/* Typography specimen */}
      <section>
        <p className="eyebrow mb-3">Typography</p>
        <div className="space-y-2">
          {brief.typography.map((t, i) => (
            <motion.div
              key={`${t}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-4"
            >
              <p className="text-sm text-zinc-200 font-medium">{t}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Avoid list — framed as a quiet side note, not a warning */}
      {brief.avoidList.length > 0 && (
        <section>
          <p className="eyebrow mb-3">Avoid</p>
          <ul className="flex flex-wrap gap-2">
            {brief.avoidList.map((item, i) => (
              <motion.li
                key={`${item}-${i}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="text-xs text-zinc-400 px-3 py-1.5 rounded-full border border-zinc-800/70 bg-zinc-900/30"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
