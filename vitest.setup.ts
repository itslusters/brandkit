import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Globally stub `server-only` so tests can import modules that mark themselves
// server-only (e.g., lib/gemini.ts, lib/wordmark.ts). Next.js enforces this at
// build time to prevent client bundling; in tests we execute them directly.
vi.mock('server-only', () => ({}))
