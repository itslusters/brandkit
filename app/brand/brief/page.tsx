'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StyleBriefDisplay } from '@/components/brand/StyleBriefDisplay'
import { StaggerChildren, StaggerItem } from '@/components/ui/StaggerChildren'
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
    <StaggerChildren className="pt-4 pb-12">
      <StaggerItem>
        <div className="mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Selected Name</p>
          <h1 className="text-3xl font-bold tracking-tight text-white">{selectedName}</h1>
        </div>
      </StaggerItem>

      <StaggerItem>
        <StyleBriefDisplay brief={result.styleBrief} />
      </StaggerItem>

      <StaggerItem>
        <button
          type="button"
          onClick={() => router.push('/brand/logo/type')}
          className="mt-10 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm active:scale-[0.97] transition-transform"
        >
          Create logo →
        </button>
      </StaggerItem>
    </StaggerChildren>
  )
}
