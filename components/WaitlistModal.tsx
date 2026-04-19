'use client'
import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
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

  const planLabel = plan === 'pro' ? 'Pro' : 'Essentials'

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
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
            <Check size={22} className="text-emerald-400" strokeWidth={3} />
          </div>
          <h2 className="text-lg font-bold text-white leading-tight mb-2">
            You&apos;re on the list.
          </h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            We&apos;ll email you the moment {planLabel} unlocks on iOS. Until then, the free tier stays yours.
          </p>
          <button onClick={onClose} className="btn btn-primary btn-full">
            Got it
          </button>
        </>
      ) : (
        <>
          <p className="eyebrow mb-3">{planLabel} waitlist</p>
          <h2 className="text-lg font-bold text-white leading-tight mb-2">
            Be first when it drops.
          </h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Paid plans ship inside the iOS app. Drop your email and we&apos;ll notify you before public launch.
          </p>
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Email</label>
              <input
                type="email"
                role="textbox"
                aria-label="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!prefilledEmail}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">What features matter most? <span className="text-zinc-700">(optional)</span></label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
                placeholder="e.g., faster turnaround, more mockups, custom palette…"
                className="input resize-none h-20 text-sm"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg"
            >
              {loading ? 'Submitting…' : <>Join waitlist <ArrowRight size={15} /></>}
            </button>
          </form>
        </>
      )}
    </BottomSheet>
  )
}
