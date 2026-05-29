export const maxDuration = 60

import { resolveRequestIdentity } from '@/lib/request-identity'
import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { generateMockup } from '@/lib/mockups-imagen'
import { getLogoLimiter } from '@/lib/ratelimit'
import { requireTier, getUserTier } from '@/lib/tier'
import type { BrandInput, BrandResult, MockupResult } from '@/lib/types'

interface RequestBody {
  templateIds: string[]
  brandName: string
  brandResult: BrandResult
  /** Optional — passes the original industry string straight through so the
   *  mockup anchor uses the user input rather than the LLM's industry
   *  archetype paraphrase, which sometimes drifts away from the keyword set. */
  brandInput?: BrandInput
}

/**
 * Mockups are an Essentials+ feature. Each selected template renders
 * through Imagen 4 and gets uploaded to Vercel Blob so subsequent PDF / ZIP
 * downloads can rehydrate without re-invoking the image model.
 */
export async function POST(req: Request) {
  const { userId, rlKey } = await resolveRequestIdentity(req)

  // Mockups are Essentials+. Anonymous free users fall through to the tier gate
  // and receive 403 — the correct business response (not 401).
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

  // Rate limit before hitting Recraft — each mockup costs ~$0.04. Without a
  // cap a single user could burn tens of dollars by re-generating in a loop.
  // Reuse the logo limiter (same tier ladder: free 30 / essentials 80 /
  // solo+pro 250 / studio 800 per day).
  if (process.env.NODE_ENV !== 'development') {
    const tier = userId ? await getUserTier() : 'free'
    const { success } = await getLogoLimiter(tier).limit(`mockup:${rlKey}`)
    if (!success) {
      return Response.json(
        { error: 'rate_limited', message: 'Daily mockup limit reached. Try again tomorrow.' },
        { status: 429 }
      )
    }
  }

  let body: RequestBody
  try { body = await req.json() as RequestBody } catch { return Response.json({ error: 'invalid_json' }, { status: 400 }) }

  const { templateIds, brandName, brandResult, brandInput } = body
  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    return Response.json({ error: 'no_templates' }, { status: 400 })
  }
  if (!brandName || !brandResult?.styleBrief) {
    return Response.json({ error: 'missing_brand' }, { status: 400 })
  }

  const batchId = nanoid(8)

  const outcomes = await Promise.allSettled(
    templateIds.map(async (id) => {
      const raw = await generateMockup(id, brandName, brandResult, brandInput)
      const blobOwner = userId ?? rlKey
      const { url } = await put(`mockups/u/${blobOwner}/${batchId}/${id}.png`, raw, {
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
