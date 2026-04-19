'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { BrandPoll } from '@/lib/polls'

interface Props {
  initialPoll: BrandPoll
}

export function PollView({ initialPoll }: Props) {
  const [poll, setPoll] = useState(initialPoll)
  const [voted, setVoted] = useState<'A' | 'B' | null>(null)
  const [voting, setVoting] = useState(false)

  const total = poll.votesA + poll.votesB
  const pctA = total > 0 ? Math.round((poll.votesA / total) * 100) : 50
  const pctB = total > 0 ? Math.round((poll.votesB / total) * 100) : 50

  async function castVote(choice: 'A' | 'B') {
    if (voted || voting) return
    setVoting(true)
    try {
      const res = await fetch('/api/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: poll.id, choice }),
      })
      if (res.ok) {
        const { poll: updated } = await res.json() as { poll: BrandPoll }
        setPoll(updated)
        setVoted(choice)
      }
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="pt-4 pb-12 max-w-lg mx-auto">
      <p className="text-xs text-zinc-500 mb-2">Brand Poll</p>
      <h1 className="text-xl font-bold text-white mb-8">{poll.title}</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Option A */}
        <motion.button
          type="button"
          onClick={() => castVote('A')}
          disabled={voted !== null}
          whileTap={!voted ? { scale: 0.97 } : undefined}
          className={`relative rounded-2xl border p-4 text-center transition-all ${
            voted === 'A' ? 'border-white bg-zinc-900' : voted ? 'border-zinc-800/40 opacity-60' : 'border-zinc-800 hover:border-zinc-600'
          } dot-grid-card`}
        >
          <div className="relative z-10">
            <div className="bg-white rounded-xl p-4 mb-3 aspect-square flex items-center justify-center">
              <img src={poll.optionA.logoUrl} alt={poll.optionA.name} className="max-h-24 object-contain" />
            </div>
            <p className="text-sm font-semibold text-white">{poll.optionA.name}</p>
            {voted && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pctA}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-1 bg-white rounded-full mt-3 mx-auto"
              />
            )}
            {voted && <p className="text-xs text-zinc-400 mt-1 tabular-nums">{pctA}%</p>}
          </div>
        </motion.button>

        {/* Option B */}
        <motion.button
          type="button"
          onClick={() => castVote('B')}
          disabled={voted !== null}
          whileTap={!voted ? { scale: 0.97 } : undefined}
          className={`relative rounded-2xl border p-4 text-center transition-all ${
            voted === 'B' ? 'border-white bg-zinc-900' : voted ? 'border-zinc-800/40 opacity-60' : 'border-zinc-800 hover:border-zinc-600'
          } dot-grid-card`}
        >
          <div className="relative z-10">
            <div className="bg-white rounded-xl p-4 mb-3 aspect-square flex items-center justify-center">
              <img src={poll.optionB.logoUrl} alt={poll.optionB.name} className="max-h-24 object-contain" />
            </div>
            <p className="text-sm font-semibold text-white">{poll.optionB.name}</p>
            {voted && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pctB}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-1 bg-white rounded-full mt-3 mx-auto"
              />
            )}
            {voted && <p className="text-xs text-zinc-400 mt-1 tabular-nums">{pctB}%</p>}
          </div>
        </motion.button>
      </div>

      {voted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-xs text-zinc-500 mb-4">{total} vote{total !== 1 ? 's' : ''}</p>
          <a
            href="/brand/new"
            className="inline-flex items-center justify-center bg-white text-zinc-950 px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors"
          >
            Create your own brand →
          </a>
        </motion.div>
      )}

      {!voted && (
        <p className="text-center text-xs text-zinc-600">Tap to vote. No sign-up required.</p>
      )}
    </div>
  )
}
