import * as Sentry from '@sentry/nextjs'

/**
 * Next.js instrumentation hook — runs once per runtime at startup.
 * Consolidates the old `sentry.server.config.ts` and `sentry.edge.config.ts`
 * into the recommended register() pattern. Client-side init still lives in
 * `sentry.client.config.ts` (supported on webpack; move to
 * `instrumentation-client.ts` only when migrating to Turbopack).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === 'production',
    })
  }
}
