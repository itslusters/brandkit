// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { isValidEmail } from '@/lib/email'

describe('isValidEmail', () => {
  it('accepts standard formats', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('user.name+tag@sub.domain.com')).toBe(true)
  })

  it('rejects obvious bad input', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('no-at-sign')).toBe(false)
    expect(isValidEmail('@nothing.com')).toBe(false)
    expect(isValidEmail('nothing@')).toBe(false)
    expect(isValidEmail('  ')).toBe(false)
  })

  it('trims surrounding whitespace before validating', () => {
    expect(isValidEmail('  a@b.co  ')).toBe(true)
  })
})
