// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock rate limiter so tests don't hit Upstash
vi.mock('@/lib/ratelimit', () => ({
  briefLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  logoLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  emailLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  getIp: () => '127.0.0.1',
}))

// Mock the entire lib/claude module
vi.mock('@/lib/claude', () => ({
  anthropic: {
    messages: {
      create: vi.fn(),
    },
  },
  buildBrandPrompt: vi.fn(() => 'mock prompt'),
  parseNamingCandidates: vi.fn(() => [
    { name: 'Nexio', rationale: '테스트 이름' },
  ]),
  parseStyleBrief: vi.fn(() => ({
    recommendedStyle: 'Minimal',
    colorPalette: ['#000', '#fff', '#f00'],
    typography: ['Inter', 'Playfair'],
    avoidList: ['그라디언트'],
    moodImages: ['minimal-tech-1'],
  })),
}))

import { anthropic } from '@/lib/claude'
import { POST } from '@/app/api/brand/stream/route'
import type { BrandInput } from '@/lib/types'

const mockInput: BrandInput = {
  companyName: 'TestCo',
  industry: 'SaaS / Software',
  targetCustomer: 'Founders',
  tones: ['Bold', 'Minimal', 'Trusted'],
  competitor: '',
}

function makeAsyncIterator(lines: string[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const text of lines) {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text } }
      }
    },
  }
}

async function collectSSE(res: Response): Promise<object[]> {
  const text = await res.text()
  return text
    .split('\n\n')
    .filter(msg => msg.startsWith('data: '))
    .map(msg => JSON.parse(msg.slice(6)))
}

describe('POST /api/brand/stream', () => {
  beforeEach(() => {
    vi.mocked(anthropic.messages.create).mockResolvedValue(
      makeAsyncIterator([
        '[INDUSTRY_START]\n',
        'SaaS B2B archetype\n',
        '[NAMING_START]\n',
        'Nexio|테스트 이름\n',
        '[BRIEF_START]\n',
        '{"recommendedStyle":"Minimal","colorPalette":["#000","#fff","#f00"],"typography":["Inter","Playfair"],"avoidList":["그라디언트"],"moodImages":["minimal-tech-1"]}',
      ]) as any
    )
  })

  it('returns a Response with SSE content-type', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(mockInput),
    })
    const res = await POST(req)
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')
  })

  it('emits token events for industry section', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(mockInput),
    })
    const res = await POST(req)
    const events = await collectSSE(res)
    const tokenEvents = events.filter((e: any) => e.type === 'token' && e.section === 'industry')
    expect(tokenEvents.length).toBeGreaterThan(0)
  })

  it('emits done event with BrandResult', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(mockInput),
    })
    const res = await POST(req)
    const events = await collectSSE(res)
    const doneEvent = events.find((e: any) => e.type === 'done') as any
    expect(doneEvent).toBeDefined()
    expect(doneEvent.result).toHaveProperty('industry')
    expect(doneEvent.result).toHaveProperty('namingCandidates')
    expect(doneEvent.result).toHaveProperty('styleBrief')
  })

  it('emits error event when stream throws', async () => {
    vi.mocked(anthropic.messages.create).mockRejectedValue(new Error('API error'))
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify(mockInput),
    })
    const res = await POST(req)
    const events = await collectSSE(res)
    const errorEvent = events.find((e: any) => e.type === 'error') as any
    expect(errorEvent).toBeDefined()
    expect(errorEvent.message).toContain('API error')
  })
})
