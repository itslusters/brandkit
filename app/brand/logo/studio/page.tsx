'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { LogoResultCard } from '@/components/brand/LogoResultCard'
import { getSession, setSession } from '@/lib/session'
import type { BrandInput, BrandResult, LogoType, IterationModifier } from '@/lib/types'

const RETRY_CAP = 2
const ITERATIONS_MAX = 3

const ITERATION_CHIPS: { id: IterationModifier; label: string }[] = [
  { id: 'bolder', label: 'Bolder' },
  { id: 'minimal', label: 'More minimal' },
  { id: 'geometric', label: 'More geometric' },
  { id: 'organic', label: 'More organic' },
  { id: 'playful', label: 'More playful' },
]

type CardState = 'skeleton' | 'result'

interface LogoCard {
  state: CardState
  dataUrl?: string
}

type SSEEvent =
  | { type: 'image_ready'; index: number; dataUrl: string }
  | { type: 'image_error'; index: number; message: string }
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
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [iterationsUsed, setIterationsUsed] = useState(0)
  const [modifier, setModifier] = useState<IterationModifier | null>(null)

  // Session guard
  useEffect(() => {
    const r = getSession<BrandResult>('brandResult')
    const name = getSession<string>('selectedName')
    const type = getSession<LogoType>('logoType')
    if (!r || !name || !type) { router.replace('/brand/new'); return }
  }, [router])

  // SSE stream — re-runs on retry / iteration
  useEffect(() => {
    const brandInput = getSession<BrandInput>('brandInput')
    const brandResult = getSession<BrandResult>('brandResult')
    const selectedName = getSession<string>('selectedName')
    const logoType = getSession<LogoType>('logoType')
    if (!brandResult || !selectedName || !logoType) return
    if (!brandInput) { setErrorMessage('Missing brand input'); setHasError(true); return }

    let aborted = false
    const controller = new AbortController()

    async function run() {
      try {
        const res = await fetch('/api/brand/logo/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandInput,
            brandResult,
            selectedName,
            logoType,
            iterationModifier: modifier ?? undefined,
          }),
          signal: controller.signal,
        })

        if (!res.ok) { setErrorMessage(`Server error: ${res.status}`); setHasError(true); return }
        if (!res.body) { setErrorMessage('No response body'); setHasError(true); return }

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
      } catch (err) {
        if (!aborted) {
          setErrorMessage(err instanceof Error ? err.message : 'Connection failed')
          setHasError(true)
        }
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
        setErrorMessage(event.message)
        setHasError(true)
      }
    }

    run()
    return () => { aborted = true; controller.abort() }
  }, [retryCount])

  function resetCards() {
    setSelected(null)
    setCards([{ state: 'skeleton' }, { state: 'skeleton' }, { state: 'skeleton' }])
    setIsDone(false)
    setHasError(false)
    setErrorMessage('')
  }

  function retry() {
    if (retryCount >= RETRY_CAP) return
    resetCards()
    setRetryCount(c => c + 1)
  }

  function iterate(mod: IterationModifier) {
    if (iterationsUsed >= ITERATIONS_MAX) return
    resetCards()
    setModifier(mod)
    setIterationsUsed(c => c + 1)
    setRetryCount(c => c + 1)
  }

  function continueToMockups() {
    if (selected === null || !cards[selected]?.dataUrl) return
    setSession('selectedLogoDataUrl', cards[selected].dataUrl!)
    router.push('/brand/mockup')
  }

  const selectedDataUrl = selected !== null ? cards[selected]?.dataUrl : undefined
  const iterationsLeft = ITERATIONS_MAX - iterationsUsed
  const canIterate = isDone && !hasError && iterationsLeft > 0

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Pick your logo</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {isDone
            ? modifier
              ? `Refined: ${ITERATION_CHIPS.find(c => c.id === modifier)?.label.toLowerCase()}. Pick one or refine again.`
              : 'Select the one you like best — or refine below.'
            : modifier
              ? `Refining (${ITERATION_CHIPS.find(c => c.id === modifier)?.label.toLowerCase()})…`
              : 'AI is generating your logos...'}
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
              dimmed={selected !== null && selected !== i}
              onSelect={() => setSelected(i)}
            />
          </motion.div>
        ))}
      </div>

      {/* Iterate chip row */}
      <AnimatePresence>
        {canIterate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-zinc-500 inline-flex items-center gap-1.5">
                <Sparkles size={12} /> Refine
              </p>
              <p className="text-xs text-zinc-500 tabular-nums">
                <span className="text-zinc-300 font-medium">{iterationsLeft}</span> left
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ITERATION_CHIPS.map(chip => (
                <motion.button
                  key={chip.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => iterate(chip.id)}
                  className="px-3 py-1.5 rounded-full border border-zinc-700 text-xs text-zinc-300 hover:border-white hover:text-white transition-colors"
                >
                  {chip.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {isDone && !hasError && iterationsLeft === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-xs text-zinc-600 text-center"
          >
            You&apos;ve used all 3 refinements this session.
          </motion.p>
        )}
      </AnimatePresence>

      {hasError && (
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm mb-2">Something went wrong.</p>
          {errorMessage && (
            <p className="text-zinc-600 text-xs mb-4 font-mono break-all px-4">{errorMessage}</p>
          )}
          {retryCount < RETRY_CAP ? (
            <button
              type="button"
              onClick={retry}
              className="px-6 py-2 rounded-xl border border-zinc-700 text-sm text-zinc-300"
            >
              Try again
            </button>
          ) : (
            <p className="text-xs text-zinc-600">Session limit reached. Refresh to start over.</p>
          )}
        </div>
      )}

      {!hasError && (
        <button
          type="button"
          onClick={continueToMockups}
          disabled={selected === null || !selectedDataUrl}
          className="mt-8 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to mockups →
        </button>
      )}
    </div>
  )
}
