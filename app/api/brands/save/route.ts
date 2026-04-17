import { auth } from '@clerk/nextjs/server'
import { uploadDataUrl } from '@/lib/blob'
import { put } from '@vercel/blob'
import { saveBrand, countBrands, FREE_TIER_BRAND_LIMIT } from '@/lib/brands'
import { getUserTier } from '@/lib/tier'
import { renderMoodImage, MOOD_VARIANTS } from '@/lib/mood-image'
import type { BrandInput, BrandResult, LogoType, MockupResult } from '@/lib/types'

interface RequestBody {
  name: string
  brandInput: BrandInput
  brandResult: BrandResult
  selectedLogoDataUrl: string
  selectedLogoType: LogoType
  mockupResults: MockupResult[]
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

    const body: RequestBody = await req.json()

    // Tier limit check
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
    const selectedLogoUrl = await uploadDataUrl(body.selectedLogoDataUrl, `brands/${userId}/logo.png`)

    // Upload mockups in parallel; skip ones with empty dataUrl (failed earlier)
    const mockupOutcomes = await Promise.allSettled(
      (body.mockupResults ?? [])
        .filter((m) => m.dataUrl)
        .map(async (m) => {
          const url = await uploadDataUrl(m.dataUrl, `brands/${userId}/mockup-${m.templateId}.png`)
          return { templateId: m.templateId, url }
        })
    )
    const mockupUrls = mockupOutcomes
      .filter((o): o is PromiseFulfilledResult<{ templateId: string; url: string }> => o.status === 'fulfilled')
      .map((o) => o.value)

    // Generate brand mood images (satori, instant, free)
    const { colorPalette } = body.brandResult.styleBrief
    const moodOutcomes = await Promise.allSettled(
      MOOD_VARIANTS.map(async (variant) => {
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
    const moodImageUrls = moodOutcomes
      .filter((o) => o.status === 'fulfilled')
      .map((o) => (o as PromiseFulfilledResult<string>).value)

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
