'use client'
import { useEffect } from 'react'
import { captureRefFromUrl } from '@/lib/ref'

/**
 * Stashes `?ref=xxx` on first mount so later waitlist submits can attribute
 * the signup even after login redirects or sheet-open navigations. Renders
 * nothing — effectful only.
 */
export function RefCapture() {
  useEffect(() => {
    captureRefFromUrl()
  }, [])
  return null
}
