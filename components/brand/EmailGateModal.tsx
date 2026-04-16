'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onSubmit: (email: string) => Promise<void>
  onClose: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmailGateModal({ open, onSubmit, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!EMAIL_RE.test(normalized)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onSubmit(normalized)
    } catch (err) {
      if (err instanceof Error && err.message === 'daily_limit') {
        setError("You've already generated a brand with this email today. Please try again tomorrow.")
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-1">One quick step</h2>
            <p className="text-sm text-zinc-400 mb-5">
              Enter your email to generate your logos. We&apos;ll never spam you.
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <input
                type="email"
                role="textbox"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600"
              />
              {error && (
                <p className="text-xs text-red-400 mt-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email}
                className="mt-4 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40"
              >
                {loading ? 'Submitting…' : 'Continue →'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
