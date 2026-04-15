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
  const progress = Math.min((elapsedSeconds / estimatedSeconds) * 100, 95)
  const remaining = Math.max(Math.ceil(estimatedSeconds - elapsedSeconds), 0)

  return (
    <div className="space-y-4">
      <ProgressBar progress={progress} />
      <motion.p
        className="text-xs text-zinc-600 text-center tabular-nums"
        animate={{ opacity: remaining === 0 ? 0 : 1 }}
      >
        ~{remaining}s remaining
      </motion.p>
      <div className="space-y-3">
        {tasks.map((task, i) => (
          <StreamCard key={task.id} task={task} index={i} />
        ))}
      </div>
    </div>
  )
}
