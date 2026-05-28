'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { StreamingDashboard } from '@/components/ui/StreamingDashboard'
import { INITIAL_STREAM_TASKS } from '@/lib/constants'
import { getSession, setSession } from '@/lib/session'
import { genFetch } from '@/lib/anon'
import type { StreamTask, BrandInput, BrandResult } from '@/lib/types'

const RETRY_CAP = 1

type SSEEvent =
  | { type: 'token'; section: string; text: string }
  | { type: 'section_done'; section: string }
  | { type: 'done'; result: BrandResult }
  | { type: 'error'; message: string }

// Narrative headlines per stream section. These run as display-2 above the
// streaming dashboard and swap as the AI moves through stages — turns the
// wait from a spinner into a short act. Keep phrasing close-lipped and
// declarative so it doesn't read like marketing copy.
const NARRATIVES: Record<string, string> = {
  idle: 'Reading your brief.',
  industry: 'Placing you in the market.',
  naming: 'Drafting names.',
  brief: 'Defining the visual language.',
  done: 'Your brand is ready.',
  error: 'Something got in the way.',
}

export default function ProcessingPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<StreamTask[]>(() => {
    const stored = typeof window !== 'undefined' ? getSession<BrandInput>('brandInput') : null
    const skipNaming = !!stored?.existingName?.trim()
    return INITIAL_STREAM_TASKS
      .filter(t => !skipNaming || t.id !== 'naming')
      .map(t => ({ ...t }))
  })
  const [elapsed, setElapsed] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const ESTIMATED = 20

  const narrativeKey = useMemo<keyof typeof NARRATIVES>(() => {
    if (hasError) return 'error'
    if (isDone) return 'done'
    const active = tasks.find(t => t.status === 'active')
    if (active) return active.id
    // If nothing is active yet but something is done, we're between sections.
    const anyDone = tasks.find(t => t.status === 'done')
    if (anyDone) {
      // Report the next pending section as the current activity.
      const next = tasks.find(t => t.status === 'pending')
      if (next) return next.id
    }
    return 'idle'
  }, [tasks, isDone, hasError])

  useEffect(() => {
    if (!getSession('brandInput')) router.replace('/brand/new')
  }, [router])

  useEffect(() => {
    if (isDone || hasError) return
    const tick = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(tick)
  }, [isDone, hasError])

  useEffect(() => {
    const input = getSession<BrandInput>('brandInput')
    if (!input) return

    let aborted = false
    const controller = new AbortController()

    async function run() {
      try {
        const res = await genFetch('/api/brand/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
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
      if (event.type === 'token') {
        setTasks(prev => prev.map(t =>
          t.id === event.section
            ? { ...t, status: 'active', content: t.content + event.text }
            : t
        ))
      } else if (event.type === 'section_done') {
        setTasks(prev => prev.map(t =>
          t.id === event.section ? { ...t, status: 'done' } : t
        ))
      } else if (event.type === 'done') {
        setSession('brandResult', event.result)
        const stored = getSession<BrandInput>('brandInput')
        if (stored?.existingName?.trim()) {
          setSession('selectedName', stored.existingName.trim())
        }
        setIsDone(true)
      } else if (event.type === 'error') {
        setErrorMessage(event.message)
        setHasError(true)
      }
    }

    run()
    return () => { aborted = true; controller.abort() }
  }, [retryCount])

  function retry() {
    if (retryCount >= RETRY_CAP) return
    const stored = getSession<BrandInput>('brandInput')
    const skipNaming = !!stored?.existingName?.trim()
    setHasError(false)
    setErrorMessage('')
    setIsDone(false)
    setElapsed(0)
    setTasks(
      INITIAL_STREAM_TASKS
        .filter(t => !skipNaming || t.id !== 'naming')
        .map(t => ({ ...t }))
    )
    setRetryCount(c => c + 1)
  }

  const liveBadgeState = isDone ? 'done' : hasError ? 'error' : 'live'

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {liveBadgeState === 'live' && <span className="live-dot" />}
          <p className="text-sm text-zinc-500">
            {liveBadgeState === 'live' && 'Building your brand'}
            {liveBadgeState === 'done' && 'Complete'}
            {liveBadgeState === 'error' && 'Interrupted'}
          </p>
        </div>
        <AnimatePresence mode="wait">
          <motion.h1
            key={narrativeKey}
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl font-semibold text-white"
          >
            {NARRATIVES[narrativeKey]}
          </motion.h1>
        </AnimatePresence>
        <p className="text-sm text-zinc-500 mt-2 max-w-md leading-relaxed">
          {hasError
            ? 'We couldn\'t finish the stream. You can try again below.'
            : isDone
              ? 'Every piece of the brief is written and parsed. Ready to view.'
              : 'Streaming from Claude — nothing is pre-generated, so this is your brand being made in real time.'}
        </p>
      </div>

      <StreamingDashboard
        tasks={tasks}
        estimatedSeconds={ESTIMATED}
        elapsedSeconds={elapsed}
      />

      {isDone && (() => {
        const stored = getSession<BrandInput>('brandInput')
        const skipNaming = !!stored?.existingName?.trim()
        return (
          <button
            onClick={() => router.push(skipNaming ? '/brand/brief' : '/brand/naming')}
            className="btn btn-primary btn-full btn-lg mt-10"
          >
            {skipNaming ? 'View brand brief' : 'Choose a name'}
            <ArrowRight size={16} />
          </button>
        )
      })()}

      {hasError && (
        <div className="mt-10 text-center">
          {errorMessage && (
            <p className="text-zinc-600 text-xs mb-4 font-mono break-all px-4">{errorMessage}</p>
          )}
          {retryCount < RETRY_CAP ? (
            <button type="button" onClick={retry} className="btn btn-secondary">
              Try again
            </button>
          ) : (
            <p className="text-xs text-zinc-600">Session limit reached. Refresh to start over.</p>
          )}
        </div>
      )}
    </div>
  )
}
