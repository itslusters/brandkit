export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { generateRecraftMockup } from '@/lib/mockups-recraft'
import { requireTier } from '@/lib/tier'
import type { BrandResult, MockupResult } from '@/lib/types'

interface RequestBody {
  templateIds: string[]
  brandName: string
  brandResult: BrandResult
}

/**
 * Mockups are an Essentials+ feature. Each selected template renders
 * through Recraft V3 `realistic_image` and gets uploaded to Vercel Blob so
 * subsequent PDF / ZIP downloads can rehydrate without re-invoking Recraft.
 */
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const gate = await requireTier('essentials')
  if (!gate.ok) {
    return Response.json(
      {
        error: 'tier_required',
        message: 'Mockups are part of Essentials and above. Upgrade to generate photorealistic mockups of your brand.',
      },
      { status: 403 }
    )
  }

  let body: RequestBody
  try { body = await req.json() as RequestBody } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }) }

  const { templateIds, brandName, brandResult } = body
  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return Response.json({ error: 'no_templates' }, { status: 400 })
  }
  if (!brandName || !brandResult?.styleBrief) {
    return Response.json({ error: 'missing_brand' }, { status: 400 })
  }

  const batchId = nanoid(8)

  const outcomes = await Promise.allSettled(
    templateIds.map(async (id) => {
      const raw = await generateRecraftMockup(id, brandName, brandResult)
      const { url } = await put(`mockups/u/${userId}/${batchId}/${id}.png`, raw, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: true,
      })
      const result: MockupResult = {
        templateId: id,
        dataUrl: `data:image/png;base64,${raw.toString('base64')}`,
        url,
      }
      return result
    })
  )

  const results: MockupResult[] = outcomes.map((outcome, idx) => {
    if (outcome.status === 'fulfilled') return outcome.value
    const reason = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason)
    console.error(`[mockup/generate] ${templateIds[idx]} failed:`, reason)
    return {
      templateId: templateIds[idx],
      dataUrl: '',
      error: reason,
    }
  })

  return Response.json({ results })
}
