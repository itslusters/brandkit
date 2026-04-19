'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { isNative } from '@/lib/native'
import { restorePurchases } from '@/lib/iap'

/**
 * iOS App Store requires apps with IAP to expose a "Restore purchases" entry
 * so users who reinstall or switch devices can reclaim previously-bought
 * entitlements. Only renders on native; no-ops on web.
 */
export function RestorePurchasesButton() {
  const { user } = useUser()
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<'idle' | 'ok' | 'none' | 'error'>('idle')

  useEffect(() => {
    setShow(isNative())
  }, [])

  if (!show) return null

  async function handle() {
    if (!user?.id) return
    setBusy(true)
    setStatus('idle')
    try {
      const ok = await restorePurchases(user.id)
      setStatus(ok ? 'ok' : 'none')
      if (ok) {
        // Re-fetch Clerk claims to pick up the new tier immediately.
        setTimeout(() => window.location.reload(), 800)
      }
    } catch {
      setStatus('error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mb-6">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">iOS purchases</p>
      <button
        type="button"
        onClick={handle}
        disabled={busy}
        className="text-sm text-zinc-300 underline hover:text-white disabled:opacity-50"
      >
        {busy ? 'Restoring…' : 'Restore purchases'}
      </button>
      {status === 'ok' && <p className="mt-2 text-xs text-emerald-400">Purchases restored.</p>}
      {status === 'none' && <p className="mt-2 text-xs text-zinc-500">No previous purchases found.</p>}
      {status === 'error' && <p className="mt-2 text-xs text-red-400">Could not restore. Try again.</p>}
    </section>
  )
}
