'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share, Plus } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'kiln:pwa-install-dismissed'
const DISMISS_DAYS = 7
const SHOW_DELAY_MS = 20_000

function wasRecentlyDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false
  const raw = localStorage.getItem(DISMISSED_KEY)
  if (!raw) return false
  const ts = Number(raw)
  if (Number.isNaN(ts)) return false
  return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIpadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return /iPhone|iPad|iPod/.test(ua) || isIpadOS
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [mode, setMode] = useState<'hidden' | 'android' | 'ios'>('hidden')

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setMode('android')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    let iosTimer: ReturnType<typeof setTimeout> | undefined
    if (isIos()) {
      iosTimer = setTimeout(() => setMode('ios'), SHOW_DELAY_MS)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setMode('hidden')
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted' || outcome === 'dismissed') {
      setDeferred(null)
      setMode('hidden')
      if (outcome === 'dismissed') dismiss()
    }
  }

  return (
    <AnimatePresence>
      {mode !== 'hidden' && (
        <motion.div
          key="install-prompt"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed inset-x-3 z-50 md:left-auto md:right-6 md:max-w-sm"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
        >
          <div className="relative rounded-2xl border border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="aurora-glow w-[240px] h-[160px] bg-blue-600/20 top-[-60px] left-[-40px]" style={{ animationDelay: '0s' }} />

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800/80 transition-colors"
            >
              <X size={14} />
            </button>

            <div className="relative flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-black text-lg font-black shadow-lg shadow-black/30">
                K
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="eyebrow mb-1">Install Kiln</p>
                <p className="text-sm font-semibold text-white leading-tight">
                  {mode === 'android' ? 'One tap to home screen' : 'Add Kiln to your home screen'}
                </p>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {mode === 'android'
                    ? 'Full-screen experience, offline-ready brand kits, faster launches.'
                    : (
                      <>
                        Tap <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-medium align-middle text-zinc-200"><Share size={9} /> Share</span>, then <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-medium align-middle text-zinc-200"><Plus size={9} /> Add to Home Screen</span>.
                      </>
                    )}
                </p>
                {mode === 'android' && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={install} className="btn btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.8125rem' }}>
                      Install
                    </button>
                    <button type="button" onClick={dismiss} className="btn btn-secondary" style={{ padding: '0.55rem 1rem', fontSize: '0.8125rem' }}>
                      Not now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
