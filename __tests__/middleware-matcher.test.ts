// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (fn: unknown) => fn,
  createRouteMatcher: (patterns: string[]) => {
    const res = patterns.map((p) => new RegExp('^' + p.replace(/\(\.\*\)/g, '(?:/.*)?') + '$'))
    return (req: { url?: string; nextUrl?: { pathname: string } }) => {
      const path = req.nextUrl?.pathname ?? new URL(req.url as string).pathname
      return res.some((r) => r.test(path))
    }
  },
}))

import { isProtectedRoute } from '@/middleware'

const at = (pathname: string) => ({ nextUrl: { pathname } }) as never

describe('isProtectedRoute', () => {
  it('leaves the funnel + generation routes public', () => {
    expect(isProtectedRoute(at('/brand/new'))).toBe(false)
    expect(isProtectedRoute(at('/brand/logo/studio'))).toBe(false)
    expect(isProtectedRoute(at('/api/brand/stream'))).toBe(false)
    expect(isProtectedRoute(at('/api/brand/logo/generate'))).toBe(false)
  })

  it('still protects account + saved-brand CRUD', () => {
    expect(isProtectedRoute(at('/account/brands'))).toBe(true)
    expect(isProtectedRoute(at('/api/brands/save'))).toBe(true)
  })
})
