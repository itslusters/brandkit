'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { UpgradeModal } from '@/components/UpgradeModal'
import { WaitlistModal } from '@/components/WaitlistModal'
import { MOOD_TEMPLATES, MOOD_FREE_COUNT, getMoodById } from '@/lib/mood-templates'
import { getSession } from '@/lib/session'
import type { BrandInput, BrandResult } from '@/lib/types'

type TileState = 'skeleton' | 'result' | 'error' | 'locked'

interface MoodTile {
  templateId: string
  state: TileState
  dataUrl?: string
  errorMessage?: string
}

type SSEEvent =
  | { type: 'plan'; generating: string[]; locked: string[]; tier: string }
  | { type: 'image_ready'; index: number; templateId: string; dataUrl: string }
  | { type: 'image_error'; index: number; templateId: string; message: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

export default function MoodPage() {
  const router = useRouter()
  const { user } = useUser()
  const [ready, setReady] = useState(false)
  const [tiles, setTiles] = useState<MoodTile[]>(
    MOOD_TEMPLATES.map((t, i) => ({
      templateId: t.id,
      state: i < MOOD_FREE_COUNT ? 'skeleton' : 'locked',
    }))
  )
  const [isDone, setIsDone] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [waitlistPlan, setWaitlistPlan] = useState<'essentials' | 'pro' | null>(null)

  useEffect(() => {
    const r = getSession<BrandResult>('brandResult')
    const i = getSession<BrandInput>('brandInput')
    if (!r || !i) { router.replace('/brand/new'); return }
    setReady(true)
  }, [router])

  useEffect(() => {
    if (!ready) return
    const brandInput = getSession<BrandInput>('brandInput')
    const brandResult = getSession<BrandResult>('brandResult')
    if (!brandInput || !brandResult) return

    const controller = new AbortController()

    async function run() {
      try {
        const res = await fetch('/api/brand/mood/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandInput, brandResult }),
          signal: controller.signal,
        })
        if (!res.ok || !res.body) throw new Error(`Server error: ${res.status}`)

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        while (true) {
          const { value, done } = await reader.read()
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
        if ((err as Error).name === 'AbortError') return
        console.error('[mood] stream failed:', err)
      }
    }

    function handle(event: SSEEvent) {
      if (event.type === 'plan') {
        setTiles((prev) => {
          const map = new Map(prev.map((t) => [t.templateId, t]))
          const generating = event.generating.map((id) => ({
            templateId: id,
            state: 'skeleton' as TileState,
          }))
          const locked = event.locked.map((id) => {
            const existing = map.get(id)
            return { templateId: id, state: 'locked' as TileState, dataUrl: existing?.dataUrl }
          })
          return [...generating, ...locked]
        })
      } else if (event.type === 'image_ready') {
        setTiles((prev) =>
          prev.map((tile) =>
            tile.templateId === event.templateId
              ? { ...tile, state: 'result', dataUrl: event.dataUrl }
              : tile
          )
        )
      } else if (event.type === 'image_error') {
        setTiles((prev) =>
          prev.map((tile) =>
            tile.templateId === event.templateId
              ? { ...tile, state: 'error', errorMessage: event.message }
              : tile
          )
        )
      } else if (event.type === 'done') {
        setIsDone(true)
      }
    }

    run()
    return () => controller.abort()
  }, [ready])

  const onLockedClick = useCallback(() => setUpgradeOpen(true), [])

  if (!ready) return null

  return (
    <div className="pt-4 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Brand mood</h1>
        <p className="text-zinc-500 text-sm mt-1">
          A visual direction for your brand. {user ? '' : 'Free preview — upgrade to unlock all.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {tiles.map((tile, i) => {
          const tpl = getMoodById(tile.templateId)
          if (!tpl) return null
          return (
            <motion.div
              key={tile.templateId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
              className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800"
            >
              {tile.state === 'skeleton' && (
                <div className="absolute inset-0 dot-grid-card" />
              )}
              {tile.state === 'result' && tile.dataUrl && (
                <motion.img
                  src={tile.dataUrl}
                  alt={tpl.label}
                  initial={{ opacity: 0, scale: 1.04, filter: 'blur(16px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ type: 'spring', stiffness: 180, damping: 28 }}
                  className="w-full h-full object-cover"
                />
              )}
              {tile.state === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                  <p className="text-[10px] text-red-300 font-medium">Generation failed</p>
                  {tile.errorMessage && (
                    <p className="text-[9px] text-zinc-500 mt-1 line-clamp-3 break-words">{tile.errorMessage}</p>
                  )}
                </div>
              )}
              {tile.state === 'locked' && (
                <button
                  type="button"
                  onClick={onLockedClick}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-sm bg-zinc-950/60 cursor-pointer group"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-zinc-300 group-hover:text-white transition" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                  </svg>
                  <p className="text-[10px] font-medium text-zinc-200">Unlock</p>
                </button>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 pointer-events-none">
                <p className="text-[10px] font-medium text-white/90">{tpl.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {isDone && (
        <button
          type="button"
          onClick={() => router.push('/brand/mockup')}
          className="mt-8 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm"
        >
          Continue to mockups →
        </button>
      )}

      {isDone && tiles.some((t) => t.state === 'locked') && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
        >
          <p className="text-sm font-semibold text-white">See the full visual direction</p>
          <p className="text-xs text-zinc-400 mt-1">
            Unlock all {MOOD_TEMPLATES.length} mood images, full PNG downloads, SVG logo, and the brand guide PDF.
          </p>
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="mt-4 w-full py-3 rounded-xl border border-zinc-700 text-zinc-200 font-semibold text-sm"
          >
            Upgrade
          </button>
        </motion.div>
      )}

      <UpgradeModal
        open={upgradeOpen}
        reason={`Free shows ${MOOD_FREE_COUNT} mood images. Upgrade to unlock all ${MOOD_TEMPLATES.length} + downloads.`}
        onClose={() => setUpgradeOpen(false)}
        onChoosePlan={(plan) => {
          setUpgradeOpen(false)
          setWaitlistPlan(plan)
        }}
      />
      <WaitlistModal
        open={waitlistPlan !== null}
        plan={waitlistPlan ?? 'essentials'}
        prefilledEmail={user?.primaryEmailAddress?.emailAddress ?? ''}
        onClose={() => setWaitlistPlan(null)}
      />
    </div>
  )
}
