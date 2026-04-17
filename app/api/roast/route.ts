import { anthropic } from '@/lib/claude'
import { briefLimiter, getIp } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const ip = getIp(req)
  const { success } = await briefLimiter.limit(ip)
  if (!success) {
    return Response.json({ error: 'rate_limit', message: 'Too many requests.' }, { status: 429 })
  }

  const { brandName, industry } = await req.json() as { brandName?: string; industry?: string }
  if (!brandName?.trim()) return Response.json({ error: 'missing_name' }, { status: 400 })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `You are a brutally honest brand critic. Grade this brand on a scale from F to A+.

Brand name: "${brandName.trim()}"
${industry ? `Industry: ${industry}` : ''}

Evaluate these dimensions (1 sentence each):
1. Name memorability & pronunciation
2. Positioning clarity
3. Market differentiation potential
4. Emotional resonance

Then give an overall letter grade (F, D, C, B, A, A+) and a one-sentence verdict.

Output ONLY valid JSON, no markdown:
{"nameScore":"B+","positioningScore":"A","differentiationScore":"C","emotionalScore":"B","overallGrade":"B+","verdict":"One sentence brutal truth.","details":{"name":"1 sentence","positioning":"1 sentence","differentiation":"1 sentence","emotional":"1 sentence"}}`
    }],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''

  try {
    const result = JSON.parse(text.trim())
    return Response.json({ result })
  } catch {
    return Response.json({ error: 'parse_failed', raw: text }, { status: 500 })
  }
}
