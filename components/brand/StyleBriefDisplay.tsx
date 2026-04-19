'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StyleBrief } from '@/lib/types'

interface Props {
  brief: StyleBrief
}

function ColorDot({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }
  return (
    <button type="button" onClick={copy} className="group flex items-center gap-2">
      <div className="w-5 h-5 rounded-full shrink-0 ring-1 ring-white/10" style={{ backgroundColor: hex }} />
      <AnimatePresence mode="wait">
        <motion.span key={copied ? 'c' : 'h'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className={`text-xs tabular-nums ${copied ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'} transition-colors`}
        >
          {copied ? 'Copied' : hex}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

// Single unified card — all brand brief info in one glanceable view.
// Reference: seed phrase card style — structured, clean, all-in-one.
export function StyleBriefDisplay({ brief }: Props) {
  return (
    <div className="relative rounded-2xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden card-elevated dot-grid-card">
      <div className="p-5 space-y-5">
        {/* Style */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Style</p>
          <p className="text-base font-semibold text-white leading-snug">{brief.recommendedStyle}</p>
        </div>

        {/* Palette — horizontal row */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Palette</p>
          <div className="flex flex-col gap-1.5">
            {brief.colorPalette.map((hex, i) => (
              <ColorDot key={`${hex}-${i}`} hex={hex} />
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Typography</p>
          {brief.typography.map((t, i) => (
            <p key={`${t}-${i}`} className="text-sm text-zinc-300">{t}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
