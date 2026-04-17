'use client'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

// Wrap sections of a page so each direct child animates in sequence on mount.
// Usage:
//   <StaggerChildren>
//     <div>first (instant)</div>
//     <div>second (0.06s delay)</div>
//     <div>third (0.12s delay)</div>
//   </StaggerChildren>
export function StaggerChildren({ children, className, staggerDelay }: Props) {
  const variants = staggerDelay
    ? { ...container, show: { ...container.show, transition: { staggerChildren: staggerDelay } } }
    : container

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Wrap individual items inside StaggerChildren
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  )
}
