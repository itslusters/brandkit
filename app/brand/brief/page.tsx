'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StyleBriefDisplay } from '@/components/brand/StyleBriefDisplay'
import { getSession } from '@/lib/session'
import type { BrandResult } from '@/lib/types'

export default function BriefPage() {
  const router = useRouter()
  const [result, setResult] = useState<BrandResult | null>(null)
  const [selectedName, setSelectedName] = useState('')

  useEffect(() => {
    const r = getSession<BrandResult>('brandResult')
    const name = getSession<string>('selectedName')
    if (!r || !name) { router.replace('/brand/new'); return }
    setResult(r)
    setSelectedName(name)
  }, [router])

  if (!result) return null

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">선택한 이름</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">{selectedName}</h1>
      </div>

      <StyleBriefDisplay brief={result.styleBrief} />

      <button
        type="button"
        onClick={() => router.push('/brand/logo/type')}
        className="mt-10 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm"
      >
        로고 만들기 →
      </button>
    </div>
  )
}
