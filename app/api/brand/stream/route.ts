import { auth } from '@clerk/nextjs/server'
import { anthropic, buildBrandPrompt, parseNamingCandidates, parseStyleBrief } from '@/lib/claude'
import { getBriefLimiter } from '@/lib/ratelimit'
import { getUserTier } from '@/lib/tier'
import type { BrandInput, BrandResult } from '@/lib/types'

type Section = 'industry' | 'naming' | 'brief'

function sse(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response(
      `data: ${JSON.stringify({ type: 'error', message: 'Sign in required.' })}\n\n`,
      { status: 401, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  if (process.env.NODE_ENV !== 'development') {
    const tier = await getUserTier()
    const { success } = await getBriefLimiter(tier).limit(userId)
    if (!success) {
      return new Response(
        `data: ${JSON.stringify({ type: 'error', message: 'Daily limit reached. Please try again tomorrow.' })}\n\n`,
        { status: 429, headers: { 'Content-Type': 'text/event-stream' } }
      )
    }
  }

  const input: BrandInput = await req.json()
  const prompt = buildBrandPrompt(input)

  const body = new ReadableStream({
    async start(controller) {
      try {
        const stream = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          stream: true,
          messages: [{ role: 'user', content: prompt }],
        })

        let currentSection: Section | null = null
        const buffers: Record<Section, string> = { industry: '', naming: '', brief: '' }
        let lineBuffer = ''

        for await (const event of stream) {
          if (event.type !== 'content_block_delta') continue
          if (event.delta.type !== 'text_delta') continue

          lineBuffer += event.delta.text

          // Process complete lines only (avoids split-marker issues)
          const lines = lineBuffer.split('\n')
          lineBuffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line === '[INDUSTRY_START]') {
              currentSection = 'industry'
            } else if (line === '[NAMING_START]') {
              if (currentSection) controller.enqueue(sse({ type: 'section_done', section: currentSection }))
              currentSection = 'naming'
            } else if (line === '[BRIEF_START]') {
              if (currentSection) controller.enqueue(sse({ type: 'section_done', section: currentSection }))
              currentSection = 'brief'
            } else if (currentSection && line.trim()) {
              const text = line + '\n'
              buffers[currentSection] += text
              controller.enqueue(sse({ type: 'token', section: currentSection, text }))
            }
          }
        }

        // Flush remaining lineBuffer content
        if (lineBuffer.trim() && currentSection) {
          buffers[currentSection] += lineBuffer
        }

        // Parse final result
        const result: BrandResult = {
          industry: buffers.industry.trim(),
          namingCandidates: parseNamingCandidates(buffers.naming),
          styleBrief: parseStyleBrief(buffers.brief),
        }
        if (currentSection) controller.enqueue(sse({ type: 'section_done', section: currentSection }))
        controller.enqueue(sse({ type: 'done', result }))
      } catch (err) {
        controller.enqueue(sse({ type: 'error', message: err instanceof Error ? err.message : 'Streaming failed' }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
