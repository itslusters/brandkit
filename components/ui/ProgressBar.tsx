'use client'
import { motion } from 'framer-motion'

interface Props {
  progress: number // 0–100
}

export function ProgressBar({ progress }: Props) {
  return (
    <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-white rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}
