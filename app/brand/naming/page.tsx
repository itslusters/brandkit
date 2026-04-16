'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NamingCard } from '@/components/brand/NamingCard'
import { getSession, setSession } from '@/lib/session'
import type { BrandResult } from '@/lib/types'

export default function NamingPage() {
  const router = useRouter()
  const [result, setResult] = useState<BrandResult | null>(null)
  const [selected, setSelected] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [customName, setCustomName] = useState('')

  useEffect(() => {
    const r = getSession<BrandResult>('brandResult')
    if (!r) {
      const hasInput = getSession('brandInput')
      router.replace(hasInput ? '/brand/processing' : '/brand/new')
      return
    }
    setResult(r)
  }, [router])

  function confirm() {
    const name = useCustom ? customName.trim() : selected
    if (!name) return
    setSession('selectedName', name)
    router.push('/brand/brief')
  }

  const activeName = useCustom ? customName.trim() : selected

  if (!result) return null

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Choose a name</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Pick one of the AI suggestions or type your own.
        </p>
      </div>

      <div className="space-y-3">
        {result.namingCandidates.map((c, i) => (
          <NamingCard
            key={i}
            candidate={c}
            selected={!useCustom && selected === c.name}
            onSelect={name => { setUseCustom(false); setSelected(name) }}
          />
        ))}
      </div>

      <div className="mt-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setUseCustom(true)}
          onKeyDown={e => { if (e.key === 'Enter') setUseCustom(true) }}
          className={`w-full text-left rounded-xl border p-4 transition-colors duration-200 cursor-pointer ${
            useCustom ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
          }`}
        >
          <p className="text-sm font-medium text-zinc-400">Type your own</p>
          {useCustom && (
            <input
              autoFocus
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirm() }}
              placeholder="Enter brand name"
              className="mt-2 w-full bg-transparent text-white text-base outline-none placeholder:text-zinc-700"
            />
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={confirm}
        disabled={!activeName}
        className="mt-8 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue with this name →
      </button>
    </div>
  )
}
