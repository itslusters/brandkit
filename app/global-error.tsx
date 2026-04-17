'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold gradient-text mb-4">Oops</h1>
          <p className="text-zinc-400 mb-6">Something went wrong.</p>
          <button
            onClick={reset}
            className="bg-white text-zinc-950 px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
