'use client'
import { motion } from 'framer-motion'
import { StreamCard } from './StreamCard'
import { ProgressBar } from './ProgressBar'
import type { StreamTask } from '@/lib/types'

interface Props {
  tasks: StreamTask[]
  estimatedSeconds: number
  elapsedSeconds: number
}

export function StreamingDashboard({ tasks, estimatedSeconds, elapsedSeconds }: Props) {
  const allDone = tasks.every(t => t.status === 'done')
  const safeDivisor = estimatedSeconds > 0 ? estimatedSeconds : 1
  const progress = allDone ? 100 : Math.min((elapsedSeconds / safeDivisor) * 100, 95)
  const remaining = Math.max(Math.ceil(estimatedSeconds - elapsedSeconds), 0)

  return (
    <div className="space-y-4">
      <ProgressBar progress={progress} />
      <motion.p
        className="text-xs text-zinc-600 text-center tabular-nums"
        initial={{ opacity: 1 }}
        animate={{ opacity: allDone || remaining === 0 ? 0 : 1 }}
      >
        {allDone ? 'Complete' : `~${remaining}s remaining`}
      </motion.p>
      <div className="space-y-3">
        {tasks.map((task, i) => (
          <StreamCard key={task.id} task={task} index={i} />
        ))}
      </div>
    </div>
  )
}
