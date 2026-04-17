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
    <button type="button" onClick={copy} className="flex flex-col items-center gap-1.5 group cursor-pointer">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-2xl transition-shadow group-hover:shadow-lg group-hover:shadow-white/5 card-elevated"
        style={{ backgroundColor: hex }}
      />
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-emerald-400 font-medium">Copied</motion.span>
        ) : (
          <motion.span key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-zinc-500 tabular-nums group-hover:text-zinc-300 transition-colors">{hex}</motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

// Clean card-based brief display. No "Avoid" section (that goes to PDF guide).
export function StyleBriefDisplay({ brief }: Props) {
  return (
    <div className="space-y-4">
      {/* Style card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 card-elevated">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Style</p>
        <p className="text-lg font-semibold text-white">{brief.recommendedStyle}</p>
      </div>

      {/* Palette card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 card-elevated">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Palette</p>
        <div className="flex gap-4">
          {brief.colorPalette.map((hex, idx) => (
            <ColorSwatch key={`${hex}-${idx}`} hex={hex} />
          ))}
        </div>
      </div>

      {/* Typography card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 card-elevated">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Typography</p>
        <div className="space-y-1">
          {brief.typography.map((t, idx) => (
            <p key={`${t}-${idx}`} className="text-sm text-zinc-200">{t}</p>
          ))}
        </div>
      </div>

      {/* Mood reference */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 card-elevated">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Mood</p>
        <div className="grid grid-cols-3 gap-2">
          {brief.moodImages.map((id, idx) => (
            <img
              key={id}
              src={`/mood/${id}.jpg`}
              alt={`Mood ${idx + 1}`}
              className="rounded-xl aspect-video object-cover"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
