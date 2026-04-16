'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToneSelector } from './ToneSelector'
import { INDUSTRIES } from '@/lib/constants'
import { setSession } from '@/lib/session'
import type { BrandInput } from '@/lib/types'

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
  const [customTone, setCustomTone] = useState('')

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
