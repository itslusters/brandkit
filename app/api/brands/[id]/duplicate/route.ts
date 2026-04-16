import { auth } from '@clerk/nextjs/server'
import { getBrand, saveBrand, countBrands, FREE_TIER_BRAND_LIMIT } from '@/lib/brands'
import { getUserTier } from '@/lib/tier'

interface Params { params: { id: string } }

export async function POST(_req: Request, { params }: Params) {
  try {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

    const original = await getBrand(userId, params.id)
    if (!original) return Response.json({ error: 'not_found' }, { status: 404 })

    // Tier limit applies to the clone too
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

    // Reuse the existing Blob URLs — no re-upload needed, they're immutable CDN-backed assets
    const cloned = await saveBrand({
      userId,
      name: `${original.name} (copy)`,
      industry: original.industry,
      brandInput: original.brandInput,
      brandResult: original.brandResult,
      selectedLogoUrl: original.selectedLogoUrl,
      selectedLogoType: original.selectedLogoType,
      mockupUrls: original.mockupUrls,
    })

    return Response.json({ brand: cloned })
  } catch (err) {
    console.error('[brands/duplicate] error:', err)
    return Response.json(
      { error: 'duplicate_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
