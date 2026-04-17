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
    // Mood images (abstract brand visuals)
    ;(brand.moodImageUrls ?? []).forEach((url, i) => {
      feedItems.push({ id: `${brand.id}-mood-${i}`, imageUrl: url, brandName: brand.name, brandId: brand.id })
    })
  }

  // High-quality showcase images (Imagen-generated, always present)
  const showcaseItems = [
    '/showcase/typo-1.png',
    '/showcase/gradient-1.png',
    '/showcase/product-1.png',
    '/showcase/brand-1.png',
    '/showcase/editorial-1.png',
    '/showcase/dark-1.png',
    '/showcase/color-1.png',
    '/showcase/organic-1.png',
  ].map((url, i) => ({
    id: `showcase-${i}`,
    imageUrl: url,
    brandName: 'BrandKit',
    brandId: '',
  }))

  // Interleave user brands with showcase images
  const allItems = [...feedItems, ...showcaseItems]
  // Shuffle for variety
  for (let i = allItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allItems[i], allItems[j]] = [allItems[j], allItems[i]]
  }

  return (
    <div className="relative -mx-4 md:left-1/2 md:-translate-x-1/2 md:w-screen">
      <FeedGallery items={allItems.slice(0, 30)} />
      <FeedGate totalCount={totalCount} />
    </div>
  )
}
