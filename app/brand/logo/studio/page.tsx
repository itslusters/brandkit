'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogoResultCard } from '@/components/brand/LogoResultCard'
import { getSession } from '@/lib/session'
import type { BrandInput, BrandResult, LogoType } from '@/lib/types'

type CardState = 'skeleton' | 'result'

interface LogoCard {
  state: CardState
  dataUrl?: string
}

type SSEEvent =
  | { type: 'image_ready'; index: number; dataUrl: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

export default function LogoStudioPage() {
  const router = useRouter()
  const [cards, setCards] = useState<LogoCard[]>([
    { state: 'skeleton' },
    { state: 'skeleton' },
    { state: 'skeleton' },
  ])
  const [selected, setSelected] = useState<number | null>(null)
  const [isDone, setIsDone] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Session guard
  useEffect(() => {
    const r = getSession<BrandResult>('brandResult')
    const name = getSession<string>('selectedName')
    const type = getSession<LogoType>('logoType')
    if (!r || !name || !type) { router.replace('/brand/new'); return }
  }, [router])

  // SSE stream — re-runs on retry
  useEffect(() => {
    const brandInput = getSession<BrandInput>('brandInput')
    const brandResult = getSession<BrandResult>('brandResult')
    const selectedName = getSession<string>('selectedName')
    const logoType = getSession<LogoType>('logoType')
    if (!brandInput || !brandResult || !selectedName || !logoType) return

    let aborted = false
    const controller = new AbortController()

    async function run() {
      try {
        const res = await fetch('/api/brand/logo/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandInput, brandResult, selectedName, logoType }),
          signal: controller.signal,
        })

        if (!res.ok) { setHasError(true); return }
        if (!res.body) { setHasError(true); return }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const messages = buf.split('\n\n')
          buf = messages.pop() ?? ''
          for (const msg of messages) {
            if (!msg.startsWith('data: ')) continue
            handle(JSON.parse(msg.slice(6)) as SSEEvent)
          }
        }
      } catch {
        if (!aborted) setHasError(true)
      }
    }

    function handle(event: SSEEvent) {
      if (event.type === 'image_ready') {
        setCards(prev => prev.map((card, i) =>
          i === event.index ? { state: 'result', dataUrl: event.dataUrl } : card
        ))
      } else if (event.type === 'done') {
        setIsDone(true)
      } else if (event.type === 'error') {
        setHasError(true)
      }
    }

    run()
    return () => { aborted = true; controller.abort() }
  }, [retryCount])

  function retry() {
    setHasError(false)
    setIsDone(false)
    setSelected(null)
    setCards([{ state: 'skeleton' }, { state: 'skeleton' }, { state: 'skeleton' }])
    setRetryCount(c => c + 1)
  }

  function downloadLogo() {
    if (selected === null || !cards[selected]?.dataUrl) return
    const selectedName = getSession<string>('selectedName') ?? 'logo'
    const a = document.createElement('a')
    a.href = cards[selected].dataUrl!
    a.download = `${selectedName}-logo.png`
    a.click()
  }

  const selectedDataUrl = selected !== null ? cards[selected]?.dataUrl : undefined

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">로고 선택</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {isDone ? '마음에 드는 로고를 선택하세요.' : 'AI가 로고를 생성하고 있어요...'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <LogoResultCard
              state={card.state}
              dataUrl={card.dataUrl}
              selected={selected === i}
              onSelect={() => setSelected(i)}
            />
          </motion.div>
        ))}
      </div>

      {hasError && (
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm mb-4">문제가 발생했어요.</p>
          <button
            type="button"
            onClick={retry}
            className="px-6 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-300"
          >
            다시 시도
          </button>
        </div>
      )}

      {!hasError && (
        <button
          type="button"
          onClick={downloadLogo}
          disabled={selected === null || !selectedDataUrl}
          className="mt-8 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          PNG 다운로드
        </button>
      )}
    </div>
  )
}
