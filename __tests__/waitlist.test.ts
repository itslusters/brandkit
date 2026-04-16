// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({ lpush: vi.fn().mockResolvedValue(1), smembers: vi.fn().mockResolvedValue([]), sadd: vi.fn().mockResolvedValue(1) }) },
}))

import { isValidWaitlistPlan } from '@/lib/waitlist'

describe('isValidWaitlistPlan', () => {
  it('accepts essentials and pro', () => {
    expect(isValidWaitlistPlan('essentials')).toBe(true)
    expect(isValidWaitlistPlan('pro')).toBe(true)
  })
  it('rejects anything else', () => {
    expect(isValidWaitlistPlan('free')).toBe(false)
    expect(isValidWaitlistPlan('')).toBe(false)
    expect(isValidWaitlistPlan(undefined)).toBe(false)
  })
})
