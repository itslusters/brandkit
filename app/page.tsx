import { listPublicBrands, getTotalBrandsCount } from '@/lib/brands'
import { FeedGallery, type FeedItem } from '@/components/landing/FeedGallery'
import { FeedGate } from '@/components/landing/FeedGate'

export default async function Home() {
  const [publicBrands, totalCount] = await Promise.all([
    listPublicBrands(40),
    getTotalBrandsCount(),
  ])

  // Build feed items from public brands — mix logos, mockups, cards for visual variety.
  // Attach the brand's stylePack so the client-side filter can narrow by aesthetic
  // without refetching.
  const feedItems: FeedItem[] = []

  for (const brand of publicBrands) {
    const stylePack = brand.brandInput?.stylePack
    if (brand.selectedLogoUrl) {
      feedItems.push({ id: `${brand.id}-logo`, imageUrl: brand.selectedLogoUrl, brandName: brand.name, brandId: brand.id, stylePack })
    }
    for (const m of brand.mockupUrls.slice(0, 2)) {
      feedItems.push({ id: `${brand.id}-${m.templateId}`, imageUrl: m.url, brandName: brand.name, brandId: brand.id, stylePack })
    }
  }

  // Curated showcase images (hand-picked by the designer). Showcase items
  // appear under every filter since they don't carry a stylePack.
  const showcaseImages = Array.from({ length: 14 }, (_, i) =>
    `/showcase/ref-${String(i + 1).padStart(2, '0')}.png`
  )
  const showcaseItems: FeedItem[] = showcaseImages.map((url, i) => ({
    id: `showcase-${i}`,
    imageUrl: url,
    brandName: '',
    brandId: '',
  }))

  // Interleave user brands with showcase images + shuffle for visual variety
  const allItems = [...feedItems, ...showcaseItems]
  for (let i = allItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allItems[i], allItems[j]] = [allItems[j], allItems[i]]
  }

  return (
    <div className="relative -mx-4 md:left-1/2 md:-translate-x-1/2 md:w-screen">
      <FeedGallery items={allItems} />
      <FeedGate totalCount={totalCount} />
    </div>
  )
}
