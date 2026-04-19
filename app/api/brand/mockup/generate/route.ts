export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { generateRecraftMockup } from '@/lib/mockups-recraft'
import { applyWatermark } from '@/lib/watermark'
import { getUserTier } from '@/lib/tier'
import type { BrandResult, MockupResult } from '@/lib/types'

interface RequestBody {
  templateIds: string[]
  brandName: string
  brandResult: BrandResult
}

/**
 * Recraft V3 generates contextual photorealistic mockups per template ID.
 * Each template carries its own scene prompt (see lib/mockups-recraft.ts)
 * and produces a photo-quality mockup with the brand name rendered in the
 * image. Free tier gets a diagonal "ATRIIUM" watermark; paid tiers get the
 * clean output.
 *
 * Each generated mockup is also uploaded to Vercel Blob so the saved
 * brand record can reference persistent URLs — guide / asset-pack
 * downloads then skip regeneration (Recraft is ~$0.04/mockup; regenerating
 * on every PDF or ZIP download would get expensive fast).
 */
export async function POST(req: Request) {
  const { userId } = await auth()
  // Anonymous access is fine — the mockup endpoint is part of the free
  // preview loop, and watermarking is the free-tier gate. Signed-in
  // generations get a user-scoped blob path; anonymous ones land under
  // a shared bucket with a nanoid so they can't collide.
  const scope = userId ? `u/${userId}` : `anon`

  let body: RequestBody
  try { body = await req.json() as RequestBody } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }) }

  const { templateIds, brandName, brandResult } = body
  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return Response.json({ error: 'no_templates' }, { status: 400 })
  }
  if (!brandName || !brandResult?.styleBrief) {
    return Response.json({ error: 'missing_brand' }, { status: 400 })
  }

  const tier = await getUserTier()
  const isFree = tier === 'free'
  const batchId = nanoid(8)

  const outcomes = await Promise.allSettled(
    templateIds.map(async (id) => {
      const raw = await generateRecraftMockup(id, brandName, brandResult)
      const final = isFree ? await applyWatermark(raw) : raw

      // Upload to Blob for persistent URL — used by save + future PDF/ZIP.
      const { url } = await put(`mockups/${scope}/${batchId}/${id}.png`, final, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: true,
      })

      const result: MockupResult = {
        templateId: id,
        dataUrl: `data:image/png;base64,${final.toString('base64')}`,
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
