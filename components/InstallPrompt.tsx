'use client'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'kiln:pwa-install-dismissed'
const DISMISS_DAYS = 7
const SHOW_DELAY_MS = 15_000

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
  // iOS Safari exposes navigator.standalone when launched from home screen
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  // iPadOS 13+ reports as Mac; distinguish via touch points
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

    // iOS doesn't fire beforeinstallprompt — show manual instructions after delay
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

  if (mode === 'hidden') return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 md:left-auto md:right-6 md:bottom-6 md:max-w-sm">
      <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-lg font-black">K</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Install Kiln</p>
            {mode === 'android' ? (
              <p className="mt-1 text-xs text-zinc-400">Add to your home screen for instant access and offline-ready brand kits.</p>
            ) : (
              <p className="mt-1 text-xs text-zinc-400">
                Tap <span aria-label="Share icon" className="inline-block px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px]">􀈂 Share</span> then <span className="font-medium text-zinc-200">Add to Home Screen</span>.
              </p>
            )}
            <div className="mt-3 flex gap-2">
              {mode === 'android' && (
                <button
                  type="button"
                  onClick={install}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition"
                >
                  Install
                </button>
              )}
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
