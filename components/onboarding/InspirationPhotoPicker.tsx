'use client'
import { useState } from 'react'
import { Camera, X, ImagePlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { takePhoto, isNative, haptic } from '@/lib/native'

interface Props {
  dataUrl?: string
  onChange: (dataUrl: string | undefined) => void
}

export function InspirationPhotoPicker({ dataUrl, onChange }: Props) {
  const [busy, setBusy] = useState(false)
  const native = isNative()

  async function pick() {
    setBusy(true)
    haptic('light')
    const result = await takePhoto('prompt')
    setBusy(false)
    if (result?.dataUrl) {
      haptic('success')
      onChange(result.dataUrl)
    }
  }

  function clear() {
    haptic('selection')
    onChange(undefined)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-1">
        Inspiration photo <span className="text-zinc-600">(optional)</span>
      </label>
      <p className="text-xs text-zinc-500 mb-2">
        {native
          ? 'Snap a photo of anything that inspires this brand — a package, a scene, a palette.'
          : 'Upload a reference image to keep alongside your brand kit.'}
      </p>

      <AnimatePresence mode="wait">
        {dataUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="Inspiration" className="w-full h-44 object-cover" />
            <button
              type="button"
              onClick={clear}
              className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70 text-white hover:bg-black/90 backdrop-blur-sm"
              aria-label="Remove photo"
            >
              <X size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="picker"
            type="button"
            onClick={pick}
            disabled={busy}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            {native ? <Camera size={16} /> : <ImagePlus size={16} />}
            {busy ? 'Opening…' : native ? 'Take or pick photo' : 'Choose image'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
