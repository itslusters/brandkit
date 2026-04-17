'use client'
import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Props {
  open: boolean
  plan: 'essentials' | 'pro'
  prefilledEmail: string
  onClose: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function WaitlistModal({ open, plan, prefilledEmail, onClose }: Props) {
  const [email, setEmail] = useState(prefilledEmail)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalEmail = (prefilledEmail || email).trim().toLowerCase()
    if (!EMAIL_RE.test(finalEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalEmail, plan, note: note.trim() || undefined }),
      })
      if (!res.ok) {
        if (res.status === 429) {
          setError('Too many requests. Please try again tomorrow.')
        } else {
          const j = await res.json().catch(() => ({}))
          setError((j as { message?: string }).message ?? 'Something went wrong. Try again.')
        }
        return
      }
      setDone(true)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      {done ? (
        <>
          <h2 className="text-lg font-semibold text-white mb-2">You&apos;re on the list ✓</h2>
          <p className="text-sm text-zinc-400 mb-5">We&apos;ll email you when {plan} launches.</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm">Done</button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-white mb-1">
            Join the {plan === 'pro' ? 'Pro' : 'Essentials'} waitlist
          </h2>
          <p className="text-sm text-zinc-400 mb-5">
            We&apos;re launching paid plans soon. Drop your email and we&apos;ll notify you first.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <label className="block text-xs text-zinc-500 mb-1">Email</label>
            <input
              type="email"
              role="textbox"
              aria-label="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !!prefilledEmail}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600 disabled:opacity-60"
            />
            <label className="block text-xs text-zinc-500 mt-3 mb-1">What features matter most? (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              placeholder="e.g., faster turnaround, more mockups, custom palette..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600 resize-none h-20 text-sm"
            />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40"
            >
              {loading ? 'Submitting…' : 'Join waitlist →'}
            </button>
          </form>
        </>
      )}
    </BottomSheet>
  )
}
