import { composeMockupById } from '@/lib/mockups-compose'
import { requireTier } from '@/lib/tier'
import type { MockupResult } from '@/lib/types'

interface RequestBody {
  templateIds: string[]
  logoDataUrl: string
}

export async function POST(req: Request) {
  // Mockups are a paid-tier feature. Free users can see the template catalog
  // on the mockup page (inspiration / upgrade funnel) but generation itself
  // is gated behind Essentials+. Auth is already enforced by middleware.
  const gate = await requireTier('essentials')
  if (!gate.ok) {
    return Response.json(
      {
        error: 'tier_required',
        message: 'Mockups are part of Essentials ($29) and above. Upgrade to generate.',
      },
      { status: 403 }
    )
  }

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
