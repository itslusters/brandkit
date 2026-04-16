'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { X, Heart, RotateCcw } from 'lucide-react'
import { getSession, setSession } from '@/lib/session'
import type { BrandResult, NamingCandidate } from '@/lib/types'

type Outcome = 'liked' | 'passed'

export default function NamingPage() {
  const router = useRouter()
  const [result, setResult] = useState<BrandResult | null>(null)
  const [index, setIndex] = useState(0)
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [pickedName, setPickedName] = useState('')
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

  // Keyboard shortcuts: ← skip, → like, ↑ undo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!result) return
      const total = result.namingCandidates.length
      if (index >= total) return
      if (e.key === 'ArrowRight') swipe('liked')
      else if (e.key === 'ArrowLeft') swipe('passed')
      else if (e.key === 'ArrowUp') undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, index])

  if (!result) return null

  const candidates = result.namingCandidates
  const done = index >= candidates.length
  const liked = candidates.filter((_, i) => outcomes[i] === 'liked')

  function swipe(outcome: Outcome) {
    setOutcomes(prev => [...prev, outcome])
    setIndex(i => i + 1)
  }

  function undo() {
    if (index === 0) return
    setOutcomes(prev => prev.slice(0, -1))
    setIndex(i => i - 1)
  }

  function reset() {
    setIndex(0)
    setOutcomes([])
    setPickedName('')
    setUseCustom(false)
    setCustomName('')
  }

  function confirm() {
    const name = useCustom ? customName.trim() : pickedName
    if (!name) return
    setSession('selectedName', name)
    router.push('/brand/brief')
  }

  return (
    <div className="pt-4 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Choose a name</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {done
            ? 'Pick one of your favorites — or type your own.'
            : 'Swipe right to keep, left to skip. Or use the buttons / arrow keys.'}
        </p>
      </div>

      {!done && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-zinc-500 tabular-nums">
              {index + 1} <span className="text-zinc-700">/ {candidates.length}</span>
            </span>
            <button
              onClick={undo}
              disabled={index === 0}
              className="text-xs text-zinc-500 hover:text-white disabled:opacity-30 inline-flex items-center gap-1"
            >
              <RotateCcw size={12} /> Undo
            </button>
          </div>

          <div className="relative h-80 mb-8">
            <AnimatePresence>
              {candidates.slice(index, Math.min(index + 3, candidates.length)).map((c, i) => (
                <SwipeCard
                  key={c.name}
                  candidate={c}
                  isTop={i === 0}
                  stackPos={i}
                  onSwipe={swipe}
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => swipe('passed')}
              className="w-14 h-14 rounded-full border-2 border-zinc-700 text-zinc-400 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors"
              aria-label="Skip"
            >
              <X size={24} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => swipe('liked')}
              className="w-14 h-14 rounded-full border-2 border-zinc-700 text-zinc-400 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-500 transition-colors"
              aria-label="Like"
            >
              <Heart size={24} />
            </motion.button>
          </div>
        </>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {liked.length > 0 ? (
            <>
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
                You liked {liked.length}
              </p>
              <div className="space-y-2 mb-4">
                {liked.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => { setUseCustom(false); setPickedName(c.name) }}
                    className={`w-full text-left rounded-xl border p-4 transition-colors ${
                      !useCustom && pickedName === c.name
                        ? 'border-white bg-zinc-900'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <p className="text-base font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{c.rationale}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 mb-4 text-center">
              <p className="text-sm text-zinc-500">Nothing caught your eye?</p>
              <button
                onClick={reset}
                className="mt-2 text-xs text-zinc-300 underline hover:text-white inline-flex items-center gap-1"
              >
                <RotateCcw size={12} /> Swipe again
              </button>
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            onClick={() => setUseCustom(true)}
            onKeyDown={e => { if (e.key === 'Enter') setUseCustom(true) }}
            className={`w-full text-left rounded-xl border p-4 transition-colors cursor-pointer ${
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

          <button
            type="button"
            onClick={confirm}
            disabled={!(useCustom ? customName.trim() : pickedName)}
            className="mt-6 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue with this name →
          </button>
        </motion.div>
      )}
    </div>
  )
}

interface SwipeCardProps {
  candidate: NamingCandidate
  isTop: boolean
  stackPos: number  // 0 = front, 1 = mid, 2 = back
  onSwipe: (outcome: Outcome) => void
}

function SwipeCard({ candidate, isTop, stackPos, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const likeOpacity = useTransform(x, [0, 60, 120], [0, 0.4, 1])
  const passOpacity = useTransform(x, [-120, -60, 0], [1, 0.4, 0])

  function onDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.x > 100 || info.velocity.x > 500) onSwipe('liked')
    else if (info.offset.x < -100 || info.velocity.x < -500) onSwipe('passed')
  }

  const stackedStyle = {
    scale: 1 - stackPos * 0.04,
    y: stackPos * 8,
    opacity: stackPos === 0 ? 1 : 0.5,
  }

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      initial={stackedStyle}
      animate={stackedStyle}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={isTop ? { x, rotate, zIndex: 10 - stackPos } : { zIndex: 10 - stackPos }}
      className="absolute inset-0 rounded-2xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      <p className="text-3xl md:text-4xl font-bold text-white tracking-tight text-center">
        {candidate.name}
      </p>
      <p className="mt-3 text-sm text-zinc-400 text-center max-w-xs">
        {candidate.rationale}
      </p>

      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-6 right-6 px-3 py-1 rounded-md border-2 border-emerald-500 text-emerald-500 text-xs font-bold uppercase tracking-wider rotate-12 pointer-events-none"
          >
            Keep
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-6 left-6 px-3 py-1 rounded-md border-2 border-red-500 text-red-500 text-xs font-bold uppercase tracking-wider -rotate-12 pointer-events-none"
          >
            Skip
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
