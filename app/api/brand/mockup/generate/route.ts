import { composeMockupById } from '@/lib/mockups-compose'
import { applyWatermark } from '@/lib/watermark'
import { getUserTier } from '@/lib/tier'
import type { MockupResult } from '@/lib/types'

interface RequestBody {
  templateIds: string[]
  logoDataUrl: string
}

/**
 * Mockup generation is available on every tier — free users get watermarked
 * mockups (stamped "ATRIIUM" diagonally) so they see the product end-to-end
 * before deciding to pay. Paid tiers get the clean composition.
 */
export async function POST(req: Request) {
  const { templateIds, logoDataUrl }: RequestBody = await req.json()

  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return Response.json({ error: 'no_templates' }, { status: 400 })
  }
  if (!logoDataUrl?.startsWith('data:image/')) {
    return Response.json({ error: 'invalid_logo' }, { status: 400 })
  }

  const tier = await getUserTier()
  const isFree = tier === 'free'

  const base64 = logoDataUrl.split(',')[1] ?? ''
  const logoBuffer = Buffer.from(base64, 'base64')

  // Parallel compose; one failure per template never blocks others
  const outcomes = await Promise.allSettled(
    templateIds.map(async (id) => {
      const composed = await composeMockupById(id, logoBuffer)
      const final = isFree ? await applyWatermark(composed) : composed
      const result: MockupResult = {
        templateId: id,
        dataUrl: `data:image/png;base64,${final.toString('base64')}`,
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
