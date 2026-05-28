import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Force sign-in only for account + saved-brand CRUD. The brand *creation*
// funnel and generation APIs are public (friction-zero) — anonymous abuse is
// bounded by per-device/IP rate limits, not by login. See lib/request-identity.
// Public surfaces also include: /, /pricing, /share/*, /poll/*, /sign-in,
// /sign-up, /api/public/*, /api/waitlist, /api/poll/*, /api/revenuecat/webhook.
export const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/api/brands(.*)',  // saved-brand CRUD (save/list/duplicate/[id])
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
