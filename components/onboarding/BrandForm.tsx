'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronDown, ImagePlus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToneSelector } from './ToneSelector'
import { StylePackSelector } from './StylePackSelector'
import type { StylePack } from '@/lib/style-packs'
import { INDUSTRIES } from '@/lib/constants'
import { setSession } from '@/lib/session'
import type { BrandInput } from '@/lib/types'

// Resize an uploaded image to max 1024px on its long edge and re-encode as JPEG.
// Keeps payload small enough to fit comfortably under Vercel's 4.5MB body cap.
async function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1024
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas context unavailable'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => reject(new Error('image load failed'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('file read failed'))
    reader.readAsDataURL(file)
  })
}

const EMPTY: BrandInput = {
  companyName: '',
  industry: '',
  targetCustomer: '',
  tones: [],
  competitor: '',
}

export function BrandForm() {
  const router = useRouter()
  const [form, setForm] = useState<BrandInput>(EMPTY)
  const [hasBrandName, setHasBrandName] = useState(false)
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [customTone, setCustomTone] = useState('')
  const [moodImageDataUrl, setMoodImageDataUrl] = useState<string>('')
  const [moodImageError, setMoodImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImagePick(file: File | undefined) {
    setMoodImageError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMoodImageError('Please choose an image file.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setMoodImageError('Image must be under 8MB.')
      return
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setMoodImageDataUrl(dataUrl)
    } catch {
      setMoodImageError('Could not read that image. Try another.')
    }
  }

  function clearMoodImage() {
    setMoodImageDataUrl('')
    setMoodImageError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isValid =
    form.companyName.trim().length > 0 &&
    form.industry.length > 0 &&
    form.targetCustomer.trim().length > 0 &&
    form.tones.length === 3

  function set<K extends keyof BrandInput>(key: K, value: BrandInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    const payload: BrandInput = {
      ...form,
      ...(hasBrandName ? { existingName: form.companyName.trim() } : {}),
      ...(customTone.trim() ? { customTone: customTone.trim() } : {}),
      ...(selectedPack ? { stylePack: selectedPack } : {}),
      ...(moodImageDataUrl ? { moodImageDataUrl } : {}),
    }
    setSession('brandInput', payload)
    router.push('/brand/processing')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Skip-naming toggle (sleek pill) */}
      <button
        type="button"
        onClick={() => setHasBrandName(v => !v)}
        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
          hasBrandName
            ? 'border-white bg-white text-zinc-950'
            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
        }`}
        aria-pressed={hasBrandName}
      >
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasBrandName ? 'bg-zinc-950' : 'bg-zinc-600'}`} />
        I already have a brand name
      </button>

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-zinc-400 mb-1">
          {hasBrandName ? 'Brand name' : 'Company name'}
        </label>
        <input
          id="companyName"
          required
          value={form.companyName}
          onChange={e => set('companyName', e.target.value)}
          placeholder={hasBrandName ? 'e.g. Granum' : 'e.g. Acme Corp'}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        <AnimatePresence>
          {hasBrandName && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-zinc-500 mt-2 overflow-hidden"
            >
              We&apos;ll skip the naming step and build everything around this name.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <StylePackSelector
        selected={selectedPack}
        onSelect={(pack: StylePack) => {
          setSelectedPack(prev => prev === pack.id ? null : pack.id)
          // Auto-fill tones from pack (user can override later)
          if (selectedPack !== pack.id) {
            set('tones', [...pack.tones])
          }
        }}
      />

      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-zinc-400 mb-1">
          Industry
        </label>
        <div className="relative">
          <select
            id="industry"
            required
            value={form.industry}
            onChange={e => set('industry', e.target.value)}
            className="w-full appearance-none bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 transition-colors"
          >
            <option value="">Select industry...</option>
            {INDUSTRIES.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="targetCustomer" className="block text-sm font-medium text-zinc-400 mb-1">
          Target customer
        </label>
        <textarea
          id="targetCustomer"
          required
          value={form.targetCustomer}
          onChange={e => set('targetCustomer', e.target.value)}
          placeholder="Who are you building this for?"
          rows={2}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
        />
      </div>

      <div className="space-y-2">
        <ToneSelector
          selected={form.tones}
          onChange={tones => set('tones', tones)}
        />
        <input
          id="customTone"
          value={customTone}
          onChange={e => setCustomTone(e.target.value)}
          placeholder="Or describe your own — 'Y2K nostalgia', 'scandinavian minimalism'..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
        />
      </div>

      <div>
        <label htmlFor="competitor" className="block text-sm font-medium text-zinc-400 mb-1">
          Competitor <span className="text-zinc-600">(optional)</span>
        </label>
        <input
          id="competitor"
          value={form.competitor}
          onChange={e => set('competitor', e.target.value)}
          placeholder="e.g. Stripe, Notion"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Reference image <span className="text-zinc-600">(optional)</span>
        </label>
        <p className="text-xs text-zinc-600 mb-2">
          Pinterest screenshot, brand you admire, mood board — we&apos;ll match the visual energy.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={e => handleImagePick(e.target.files?.[0])}
          className="hidden"
          id="moodImage"
        />
        <AnimatePresence mode="wait">
          {moodImageDataUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative rounded-xl overflow-hidden border border-zinc-700"
            >
              <img src={moodImageDataUrl} alt="Mood reference" className="w-full max-h-56 object-cover" />
              <button
                type="button"
                onClick={clearMoodImage}
                aria-label="Remove image"
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/90"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.label
              key="picker"
              htmlFor="moodImage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center gap-2 w-full py-6 rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-400 cursor-pointer hover:border-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <ImagePlus size={16} /> Drop or choose an image
            </motion.label>
          )}
        </AnimatePresence>
        {moodImageError && (
          <p className="mt-2 text-xs text-red-400">{moodImageError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-xl py-3.5 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
      >
        Build my brand <ArrowRight size={16} />
      </button>
    </form>
  )
}
