'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
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
    <div className="pt-4 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <p className="eyebrow mb-3">Your brand is</p>
        <h1 className="display-1 text-white">{selectedName}</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <StyleBriefDisplay brief={result.styleBrief} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="mt-12"
      >
        <button
          type="button"
          onClick={() => router.push('/brand/logo/type')}
          className="btn btn-primary btn-full btn-lg"
        >
          Create logo <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  )
}
