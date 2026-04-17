import { listPublicBrands, getTotalBrandsCount } from '@/lib/brands'
import { FeedGallery } from '@/components/landing/FeedGallery'
import { FeedGate } from '@/components/landing/FeedGate'

export default async function Home() {
  const [publicBrands, totalCount] = await Promise.all([
    listPublicBrands(40),
    getTotalBrandsCount(),
  ])

  // Build feed items from public brands — mix logos, mockups, cards for visual variety
  const feedItems: { id: string; imageUrl: string; brandName: string; brandId: string }[] = []

  for (const brand of publicBrands) {
    // Logo
    if (brand.selectedLogoUrl) {
      feedItems.push({ id: `${brand.id}-logo`, imageUrl: brand.selectedLogoUrl, brandName: brand.name, brandId: brand.id })
    }
    // First 2 mockups
    for (const m of brand.mockupUrls.slice(0, 2)) {
      feedItems.push({ id: `${brand.id}-${m.templateId}`, imageUrl: m.url, brandName: brand.name, brandId: brand.id })
    }
  }

  const hasContent = feedItems.length > 0

  return (
    <div className="relative -mx-4 md:left-1/2 md:-translate-x-1/2 md:w-screen">
      {hasContent ? (
        <>
          <FeedGallery items={feedItems} />
          <FeedGate totalCount={totalCount} />
        </>
      ) : (
        // Empty state — minimal intro until brands are created + shared
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text tracking-tight mb-4">
            BrandKit
          </h1>
          <p className="text-zinc-400 text-base max-w-md mb-8">
            AI-generated brand identities. Create yours in minutes.
          </p>
          <div className="flex gap-3">
            <a href="/brand/new" className="bg-white text-zinc-950 px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors">
              Create a brand →
            </a>
            <a href="/pricing" className="border border-zinc-700 text-zinc-200 px-6 py-3 rounded-full font-medium hover:border-zinc-500 transition-colors">
              Pricing
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
