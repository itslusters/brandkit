import { composeMockupById } from '@/lib/mockups-compose'
import type { MockupResult } from '@/lib/types'

interface RequestBody {
  templateIds: string[]
  logoDataUrl: string
}

export async function POST(req: Request) {
  const { templateIds, logoDataUrl }: RequestBody = await req.json()

  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return Response.json({ error: 'no_templates' }, { status: 400 })
  }
  if (!logoDataUrl?.startsWith('data:image/')) {
    return Response.json({ error: 'invalid_logo' }, { status: 400 })
  }

  const base64 = logoDataUrl.split(',')[1] ?? ''
  const logoBuffer = Buffer.from(base64, 'base64')

  // Parallel compose; one failure per template never blocks others
  const outcomes = await Promise.allSettled(
    templateIds.map(async (id) => {
      const composed = await composeMockupById(id, logoBuffer)
      const result: MockupResult = {
        templateId: id,
        dataUrl: `data:image/png;base64,${composed.toString('base64')}`,
      }
      return result
    })
  )

  const results = outcomes.map((outcome, idx) => {
    if (outcome.status === 'fulfilled') return outcome.value
    return {
      templateId: templateIds[idx],
      dataUrl: '',
      error: outcome.reason instanceof Error ? outcome.reason.message : 'compose failed',
    }
  })

  return Response.json({ results })
}
