'use client'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'

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
        setError("You've already generated a brand with this email today. Try again tomorrow.")
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <p className="eyebrow mb-3">One quick step</p>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight mb-2">
        Where should we send it?
      </h2>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
        Drop your email so we can save your brand for you. No spam — just a copy of what you generate.
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
          className="input"
        />
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || !email}
          className="btn btn-primary btn-full btn-lg mt-4"
        >
          {loading ? 'Submitting…' : <>Continue <ArrowRight size={15} /></>}
        </button>
      </form>
    </BottomSheet>
  )
}
