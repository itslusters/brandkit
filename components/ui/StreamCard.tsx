'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import type { StreamTask } from '@/lib/types'

interface Props {
  task: StreamTask
  index: number
}

export function StreamCard({ task, index }: Props) {
  const isActive = task.status === 'active'
  const isDone = task.status === 'done'
  const showContent = (isActive || isDone) && task.content.length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-xl border p-4 transition-colors duration-300 ${
        isDone
          ? 'border-zinc-700 bg-zinc-900'
          : isActive
          ? 'border-zinc-600 bg-zinc-900/80'
          : 'border-zinc-800 bg-zinc-950'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isDone ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
            >
              <Check size={11} className="text-black" strokeWidth={3} />
            </motion.div>
          ) : isActive ? (
            <Loader2 size={20} className="text-zinc-400 animate-spin" />
          ) : (
            <div className="w-5 h-5 rounded-full border border-zinc-700" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium transition-colors ${
            isDone ? 'text-zinc-300' : isActive ? 'text-white' : 'text-zinc-600'
          }`}>
            {task.label}
          </p>
          <AnimatePresence>
            {showContent && (
              <motion.p
                key="content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-zinc-500 mt-1 leading-relaxed"
              >
                {task.content}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
