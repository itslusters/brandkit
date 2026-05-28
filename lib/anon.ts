'use client'

const ANON_KEY = 'brandkit:anon'

/**
 * Stable per-device anonymous id. Lives in localStorage, which persists inside
 * the iOS WKWebView across launches, so the same device keeps one id without
 * any login. Used as the rate-limit key and (later) the RevenueCat alias.
 */
export function getAnonId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const existing = window.localStorage.getItem(ANON_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    window.localStorage.setItem(ANON_KEY, id)
    return id
  } catch {
    // Private mode / storage blocked: fall back to a per-session id.
    return crypto.randomUUID()
  }
}

/** fetch wrapper that injects the anon id header onto generation calls. */
export function genFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  const id = getAnonId()
  if (id) headers.set('x-anon-id', id)
  return fetch(input, { ...init, headers })
}
