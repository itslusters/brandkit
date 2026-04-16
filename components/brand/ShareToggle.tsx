'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Globe, Lock } from 'lucide-react'

interface Props {
  brandId: string
  initialPublic: boolean
}

export function ShareToggle({ brandId, initialPublic }: Props) {
  const [isPublic, setIsPublic] = useState(initialPublic)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${brandId}`
    : `/share/${brandId}`

  async function toggle() {
    setBusy(true)
    setError('')
    const next = !isPublic
    try {
      const res = await fetch(`/api/brands/${brandId}/public`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public: next }),
      })
      if (!res.ok) {
        setError('Could not update sharing.')
        return
      }
      setIsPublic(next)
    } catch {
      setError('Network error.')
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy.')
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {isPublic ? <Globe size={16} /> : <Lock size={16} />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">{isPublic ? 'Public link' : 'Private'}</p>
            <p className="text-xs text-zinc-500 truncate">
              {isPublic ? 'Anyone with the link can view' : 'Only you can see this brand'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          role="switch"
          aria-checked={isPublic}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isPublic ? 'bg-emerald-500' : 'bg-zinc-700'} disabled:opacity-50`}
        >
          <motion.span
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
            animate={{ x: isPublic ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      <AnimatePresence>
        {isPublic && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 truncate font-mono"
              />
              <motion.button
                type="button"
                onClick={copyLink}
                whileTap={{ scale: 0.95 }}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-950 hover:bg-zinc-200'}`}
              >
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}
