import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Force sign-in for the brand creation flow + account + every private API.
// Public surfaces that stay open: /, /pricing, /share/*, /poll/*, /sign-in,
// /sign-up, /api/public/*, /api/waitlist, /api/poll/*, /api/revenuecat/webhook.
const isProtectedRoute = createRouteMatcher([
  '/account(.*)',
  '/brand(.*)',
  '/api/brand(.*)',   // content generation (logo/mockup/mood/guide/assets/…)
  '/api/brands(.*)',  // saved-brand CRUD
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
