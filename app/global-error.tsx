'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { RotateCcw, Home } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body
        style={{
          backgroundColor: '#09090b',
          color: '#fafafa',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: '32rem', width: '100%' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#71717a',
              marginBottom: '0.75rem',
            }}
          >
            Something broke
          </p>
          <h1
            style={{
              fontSize: '1.5rem',
              lineHeight: 1.2,
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            We dropped the brief.
          </h1>
          <p
            style={{
              color: '#a1a1aa',
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '28rem',
            }}
          >
            Something went wrong on our end. The team has been notified. You
            can try again, or head home and start fresh.
          </p>
          {error?.digest && (
            <p
              style={{
                color: '#52525b',
                fontSize: '0.6875rem',
                fontFamily: 'ui-monospace, SF Mono, Menlo, monospace',
                marginBottom: '2rem',
              }}
            >
              Ref: {error.digest}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(180deg, #ffffff 0%, #f4f4f5 100%)',
                color: '#09090b',
                fontWeight: 600,
                fontSize: '0.9375rem',
                borderRadius: 9999,
                padding: '0.9rem 1.6rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 30px -10px rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              <RotateCcw size={15} /> Try again
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'transparent',
                color: '#e4e4e7',
                fontWeight: 600,
                fontSize: '0.9375rem',
                borderRadius: 9999,
                padding: '0.9rem 1.6rem',
                border: '1px solid #3f3f46',
                textDecoration: 'none',
              }}
            >
              <Home size={15} /> Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
