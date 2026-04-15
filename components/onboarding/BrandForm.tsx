'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronDown } from 'lucide-react'
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
    setSession('brandInput', form)
    router.push('/brand/processing')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-zinc-400 mb-1">
          Company name
        </label>
        <input
          id="companyName"
          required
          value={form.companyName}
          onChange={e => set('companyName', e.target.value)}
          placeholder="e.g. Acme Corp"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
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

      <ToneSelector
        selected={form.tones}
        onChange={tones => set('tones', tones)}
      />

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
