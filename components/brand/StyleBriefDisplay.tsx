'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StyleBrief } from '@/lib/types'

interface Props {
  brief: StyleBrief
}

function ColorSwatch({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* noop */ }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex flex-col items-center gap-1.5 group cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full border border-zinc-800 transition-shadow group-hover:shadow-lg group-hover:shadow-white/5"
        style={{ backgroundColor: hex }}
      />
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-emerald-400 font-medium"
          >
            Copied
          </motion.span>
        ) : (
          <motion.span
            key="hex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-zinc-500 tabular-nums group-hover:text-zinc-300 transition-colors"
          >
            {hex}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function StyleBriefDisplay({ brief }: Props) {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Recommended Style</p>
        <p className="text-xl font-bold text-white">{brief.recommendedStyle}</p>
      </section>

      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Color Palette</p>
        <div className="flex gap-4">
          {brief.colorPalette.map((hex, idx) => (
            <ColorSwatch key={`${hex}-${idx}`} hex={hex} />
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Typography</p>
        <ul className="space-y-1">
          {brief.typography.map((t, idx) => (
            <li key={`${t}-${idx}`} className="text-sm text-zinc-300">{t}</li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Avoid</p>
        <ul className="space-y-1.5">
          {brief.avoidList.map((item, idx) => (
            <li key={`${item}-${idx}`} className="text-sm text-zinc-300 flex items-center gap-2">
              <span className="text-red-500 shrink-0">✕</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Mood Reference</p>
        <div className="grid grid-cols-3 gap-2">
          {brief.moodImages.map((id, idx) => (
            <img
              key={id}
              src={`/mood/${id}.jpg`}
              alt={`Mood reference ${idx + 1}`}
              className="rounded-lg aspect-video object-cover bg-zinc-900"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
