'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  count: number
}

// Animated count-up on scroll into view. Shows total brands created.
export function SocialProof({ count }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!inView || count === 0) return
    let frame: number
    const duration = 1200 // ms
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * count))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, count])

  if (count === 0) return null

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
      className="text-center py-8"
    >
      <p className="text-4xl md:text-5xl font-bold text-white tabular-nums">
        {displayed.toLocaleString()}
      </p>
      <p className="text-sm text-zinc-500 mt-1">brands created with BrandKit</p>
    </motion.div>
  )
}
