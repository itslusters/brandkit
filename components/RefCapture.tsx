'use client'
import { useEffect } from 'react'
import { captureRefFromUrl } from '@/lib/ref'
import { isNative, getPlatform } from '@/lib/native'

/**
 * App-mount effects that need to run once per page load:
 *   1. Stash `?ref=xxx` for waitlist attribution.
 *   2. Tag the root html with `capacitor-native` / `ios-native` so CSS can
 *      branch on platform — e.g. hide Google OAuth buttons inside the
 *      Capacitor shell, since Google blocks WebView auth and we haven't
 *      wired ASWebAuthenticationSession yet.
 * Renders nothing — effectful only.
 */
export function RefCapture() {
  useEffect(() => {
    captureRefFromUrl()
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (isNative()) {
      root.classList.add('capacitor-native')
      const platform = getPlatform()
      if (platform === 'ios') root.classList.add('ios-native')
      if (platform === 'android') root.classList.add('android-native')
    }
  }, [])
  return null
}
