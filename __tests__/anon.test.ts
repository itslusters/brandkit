// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { getAnonId } from '@/lib/anon'

describe('getAnonId', () => {
  let store: Record<string, string> = {}

  beforeEach(() => {
    store = {}
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
      length: 0,
      key: (index: number) => null,
    }
    vi.stubGlobal('localStorage', mockStorage)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('generates and persists an id when none exists', () => {
    const id = getAnonId()
    expect(id).toMatch(/^[0-9a-f-]{36}$/)
    expect(store['brandkit:anon']).toBe(id)
  })

  it('returns the same id on subsequent calls', () => {
    const first = getAnonId()
    const second = getAnonId()
    expect(second).toBe(first)
  })
})
