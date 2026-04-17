'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StreamingDashboard } from '@/components/ui/StreamingDashboard'
import { INITIAL_STREAM_TASKS } from '@/lib/constants'
import { getSession, setSession } from '@/lib/session'
import type { StreamTask, BrandInput, BrandResult } from '@/lib/types'

const RETRY_CAP = 1

type SSEEvent =
  | { type: 'token'; section: string; text: string }
  | { type: 'section_done'; section: string }
  | { type: 'done'; result: BrandResult }
  | { type: 'error'; message: string }

export default function ProcessingPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<StreamTask[]>(() =>
    INITIAL_STREAM_TASKS.map(t => ({ ...t }))
  )
  const [elapsed, setElapsed] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const ESTIMATED = 20

  // Session guard
  useEffect(() => {
    if (!getSession('brandInput')) router.replace('/brand/new')
  }, [router])

  // Elapsed timer
  useEffect(() => {
    if (isDone || hasError) return
    const tick = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(tick)
  }, [isDone, hasError])

  // SSE stream — re-runs on retry
  useEffect(() => {
    const input = getSession<BrandInput>('brandInput')
    if (!input) return

    let aborted = false
    const controller = new AbortController()

    async function run() {
      try {
        const res = await fetch('/api/brand/stream', {
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
        // If the user provided their own brand name, skip naming and jump straight to brief
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
  }, [retryCount]) // retryCount acts as a manual trigger; incrementing it re-runs the stream

  function retry() {
    if (retryCount >= RETRY_CAP) return
    setHasError(false)
    setErrorMessage('')
    setIsDone(false)
    setElapsed(0)
    setTasks(INITIAL_STREAM_TASKS.map(t => ({ ...t })))
    setRetryCount(c => c + 1)
  }

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Building your brand</h1>
        <p className="text-zinc-500 text-sm mt-1 inline-flex items-center gap-2">
          {!isDone && !hasError && <span className="live-dot" />}
          {isDone ? 'Complete.' : hasError ? 'Error encountered.' : 'AI is analyzing your inputs.'}
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
            className="mt-8 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm"
          >
            {skipNaming ? 'View brand brief →' : 'Choose a name →'}
          </button>
        )
      })()}
      {hasError && (
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm mb-2">Something went wrong.</p>
          {errorMessage && (
            <p className="text-zinc-600 text-xs mb-4 font-mono">{errorMessage}</p>
          )}
          {retryCount < RETRY_CAP ? (
            <button
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
    </div>
  )
}
