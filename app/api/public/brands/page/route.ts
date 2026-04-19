import { listPublicBrands } from '@/lib/brands'
import { publicBrandLimiter, getIp } from '@/lib/ratelimit'

const MAX_LIMIT = 40

interface FeedItem {
  id: string
  imageUrl: string
  brandName: string
  brandId: string
  stylePack?: string
}

/**
 * Public paginated gallery feed — backs the "Load more" button on the
 * landing page. Returns up to MAX_LIMIT additional brand-derived feed
 * items at the given offset, each brand fanned out into its logo plus
 * first two mockups so the masonry keeps visual variety.
 */
export async function GET(req: Request) {
  const ip = getIp(req)
  const { success } = await publicBrandLimiter.limit(ip)
  if (!success) {
    return Response.json({ error: 'rate_limited' }, { status: 429 })
  }

  const url = new URL(req.url)
  const offset = Math.max(0, Number(url.searchParams.get('offset') ?? '0') || 0)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get('limit') ?? MAX_LIMIT) || MAX_LIMIT))

  const brands = await listPublicBrands(limit, offset)
  const items: FeedItem[] = []
  for (const brand of brands) {
    const stylePack = brand.brandInput?.stylePack
    if (brand.selectedLogoUrl) {
      items.push({ id: `${brand.id}-logo`, imageUrl: brand.selectedLogoUrl, brandName: brand.name, brandId: brand.id, stylePack })
    }
    for (const m of brand.mockupUrls.slice(0, 2)) {
      items.push({ id: `${brand.id}-${m.templateId}`, imageUrl: m.url, brandName: brand.name, brandId: brand.id, stylePack })
    }
  }

  return Response.json({
    items,
    nextOffset: brands.length < limit ? null : offset + brands.length,
  })
}
