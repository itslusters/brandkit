export const maxDuration = 30

import { auth } from '@clerk/nextjs/server'
import { uploadDataUrl } from '@/lib/blob'
import { put } from '@vercel/blob'
import { saveBrand, countBrands, FREE_TIER_BRAND_LIMIT } from '@/lib/brands'
import { getUserTier } from '@/lib/tier'
import { composeMockupById } from '@/lib/mockups-compose'
import { renderMoodImage, MOOD_VARIANTS } from '@/lib/mood-image'
import type { BrandInput, BrandResult, LogoType } from '@/lib/types'

interface RequestBody {
  name: string
  brandInput: BrandInput
  brandResult: BrandResult
  selectedLogoDataUrl: string
  selectedLogoType: LogoType
  mockupTemplateIds: string[]  // only IDs, not full data URLs (payload size)
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

    const body: RequestBody = await req.json()

    const tier = await getUserTier()
    if (tier === 'free') {
      const count = await countBrands(userId)
      if (count >= FREE_TIER_BRAND_LIMIT) {
        return Response.json(
          { error: 'limit_reached', limit: FREE_TIER_BRAND_LIMIT, message: `Free tier is limited to ${FREE_TIER_BRAND_LIMIT} saved brands. Upgrade for unlimited.` },
          { status: 402 }
        )
      }
    }

    if (!body.selectedLogoDataUrl?.startsWith('data:image/')) {
      return Response.json({ error: 'invalid_logo' }, { status: 400 })
    }

    // Upload logo
    const logoBase64 = body.selectedLogoDataUrl.split(',')[1] ?? ''
    const logoBuffer = Buffer.from(logoBase64, 'base64')
    const selectedLogoUrl = await uploadDataUrl(body.selectedLogoDataUrl, `brands/${userId}/logo.png`)

    // Regenerate + upload max 3 mockups (more would exceed Vercel timeout)
    const mockupOutcomes = await Promise.allSettled(
      (body.mockupTemplateIds ?? []).slice(0, 3).map(async (id) => {
        const composed = await composeMockupById(id, logoBuffer)
        const { url } = await put(`brands/${userId}/mockup-${id}.png`, composed, {
          access: 'public',
          contentType: 'image/png',
          addRandomSuffix: true,
        })
        return { templateId: id, url }
      })
    )
    const mockupUrls = mockupOutcomes
      .filter((o) => o.status === 'fulfilled')
      .map((o) => (o as PromiseFulfilledResult<{ templateId: string; url: string }>).value)

    // Generate mood images — best-effort, don't block save on failure
    let moodImageUrls: string[] = []
    try {
      const { colorPalette } = body.brandResult.styleBrief
      const moodOutcomes = await Promise.allSettled(
        MOOD_VARIANTS.slice(0, 2).map(async (variant) => {
          const png = await renderMoodImage({
            brandName: body.name,
            primaryColor: colorPalette[0] ?? '#18181b',
            secondaryColor: colorPalette[1] ?? '#ffffff',
            accentColor: colorPalette[2] ?? '#3b82f6',
            variant,
          })
          const { url } = await put(`brands/${userId}/mood-${variant}.png`, png, {
            access: 'public',
            contentType: 'image/png',
            addRandomSuffix: true,
          })
          return url
        })
      )
      moodImageUrls = moodOutcomes
        .filter((o) => o.status === 'fulfilled')
        .map((o) => (o as PromiseFulfilledResult<string>).value)
    } catch (err) {
      console.error('[brands/save] mood gen failed (non-blocking):', err)
    }

    const saved = await saveBrand({
      userId,
      name: body.name,
      industry: body.brandInput.industry,
      brandInput: body.brandInput,
      brandResult: body.brandResult,
      selectedLogoUrl,
      selectedLogoType: body.selectedLogoType,
      mockupUrls,
      moodImageUrls,
    })

    return Response.json({ brand: saved })
  } catch (err) {
    console.error('[brands/save] error:', err)
    return Response.json(
      { error: 'save_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
