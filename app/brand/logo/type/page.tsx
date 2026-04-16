'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogoTypeCard } from '@/components/brand/LogoTypeCard'
import { getSession, setSession } from '@/lib/session'
import type { BrandResult, LogoType } from '@/lib/types'

const LOGO_TYPES: { type: LogoType; label: string; description: string }[] = [
  {
    type: 'wordmark',
    label: 'Wordmark',
    description: '브랜드 이름을 타이포그래피로 표현',
  },
  {
    type: 'symbol-text',
    label: 'Symbol + Text',
    description: '아이콘과 텍스트를 함께 사용',
  },
  {
    type: 'emblem',
    label: 'Emblem',
    description: '배지나 방패 안에 이름을 담은 형태',
  },
]

export default function LogoTypePage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<LogoType | null>(null)

  useEffect(() => {
    const r = getSession<BrandResult>('brandResult')
    const name = getSession<string>('selectedName')
    if (!r || !name) { router.replace('/brand/new'); return }
    setReady(true)
  }, [router])

  function confirm() {
    if (!selected) return
    setSession('logoType', selected)
    router.push('/brand/logo/studio')
  }

  if (!ready) return null

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">로고 스타일 선택</h1>
        <p className="text-zinc-500 text-sm mt-1">어떤 형태의 로고를 원하시나요?</p>
      </div>

      <div className="space-y-3">
        {LOGO_TYPES.map((item, i) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <LogoTypeCard
              type={item.type}
              label={item.label}
              description={item.description}
              selected={selected === item.type}
              onSelect={() => setSelected(item.type)}
            />
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={confirm}
        disabled={!selected}
        className="mt-8 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        로고 만들기 →
      </button>
    </div>
  )
}
