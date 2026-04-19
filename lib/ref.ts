'use client'

/**
 * Referral code persistence. On any page load we sniff `?ref=xxx` from the URL
 * and, if present, stash it in localStorage so it survives login redirects
 * and sheet-based waitlist flows. `readRef()` returns the current value, URL
 * first, then stored fallback. Invalid codes are silently dropped.
 *
 * We restrict to [a-zA-Z0-9_-] so the code never gets weaponized as an XSS
 * vector — copy shows up verbatim in internal dashboards.
 */

const STORAGE_KEY = 'atriium:ref'
const MAX_LEN = 40
const VALID_RE = /^[a-zA-Z0-9_-]+$/

function sanitize(value: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_LEN) return undefined
  return VALID_RE.test(trimmed) ? trimmed : undefined
}

/** Call once on app mount — stores `?ref=` from the current URL if valid. */
export function captureRefFromUrl(): void {
  if (typeof window === 'undefined') return
  try {
    const param = new URLSearchParams(window.location.search).get('ref')
    const clean = sanitize(param)
    if (clean) window.localStorage.setItem(STORAGE_KEY, clean)
  } catch {
    // Ignore — storage access can throw in private mode / embedded webviews.
  }
}

/** Returns the active referral code: URL first, storage fallback. */
export function readRef(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const urlRef = sanitize(new URLSearchParams(window.location.search).get('ref'))
    if (urlRef) return urlRef
    return sanitize(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return undefined
  }
}
