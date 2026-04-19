export const maxDuration = 30

import { auth, currentUser } from '@clerk/nextjs/server'
import { uploadDataUrl } from '@/lib/blob'
import { saveBrand, countBrands, FREE_TIER_BRAND_LIMIT } from '@/lib/brands'
import { getUserTier } from '@/lib/tier'
import { sendBrandSavedConfirmation } from '@/lib/resend'
import type { BrandInput, BrandResult, LogoType } from '@/lib/types'

interface RequestBody {
  name: string
  brandInput: BrandInput
  brandResult: BrandResult
  selectedLogoDataUrl: string
  selectedLogoType: LogoType
  /** @deprecated legacy clients — preserved in the type for compatibility. */
  mockupTemplateIds?: string[]
  /** Recraft-generated mockups already uploaded to Blob. Persists as-is. */
  mockupUrls?: { templateId: string; url: string }[]
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
          { error: 'limit_reached', limit: FREE_TIER_BRAND_LIMIT, message: `Free tier is limited to ${FREE_TIER_BRAND_LIMIT} saved brands.` },
          { status: 402 }
        )
      }
    }

    if (!body.selectedLogoDataUrl?.startsWith('data:image/')) {
      return Response.json({ error: 'invalid_logo' }, { status: 400 })
    }

    // Upload logo only — mockups and mood images are generated on-demand
    // when viewing the saved brand. This keeps save fast and reliable.
    const selectedLogoUrl = await uploadDataUrl(body.selectedLogoDataUrl, `brands/${userId}/logo.png`)

    let referencePhotoUrl: string | undefined
    const refData = body.brandInput.referencePhotoDataUrl
    if (refData && refData.startsWith('data:image/')) {
      referencePhotoUrl = await uploadDataUrl(refData, `brands/${userId}/reference.jpg`)
    }

    // Strip transient base64 from the persisted input — the URL replaces it.
    const { referencePhotoDataUrl: _ref, ...persistedInput } = body.brandInput

    const mockupUrls = Array.isArray(body.mockupUrls)
      ? body.mockupUrls.filter((m) => typeof m.templateId === 'string' && typeof m.url === 'string')
      : []

    const saved = await saveBrand({
      userId,
      name: body.name,
      industry: body.brandInput.industry,
      brandInput: persistedInput,
      brandResult: body.brandResult,
      selectedLogoUrl,
      selectedLogoType: body.selectedLogoType,
      mockupUrls,
      referencePhotoUrl,
    })

    // Fire-and-forget email. Uses currentUser() to pull the verified
    // primary email from Clerk — not blocking the response. Errors
    // inside sendBrandSavedConfirmation are swallowed so a mail outage
    // can't poison the save result.
    currentUser()
      .then((user) => {
        const email = user?.primaryEmailAddress?.emailAddress
        if (!email) return
        return sendBrandSavedConfirmation({
          to: email,
          brandName: saved.name,
          brandId: saved.id,
          logoUrl: saved.selectedLogoUrl,
        })
      })
      .catch((err) => console.error('[brands/save] email dispatch failed:', err))

    return Response.json({ brand: saved })
  } catch (err) {
    console.error('[brands/save] error:', err)
    return Response.json(
      { error: 'save_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
