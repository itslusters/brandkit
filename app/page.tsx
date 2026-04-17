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

  // Curated showcase images (always visible, mixed with user brands)
  const showcaseItems = [
    '/landing/hero.png',
    '/landing/step-input.png',
    '/landing/step-generate.png',
    '/landing/step-download.png',
    '/mood/minimal-tech-1.jpg',
    '/mood/minimal-tech-2.jpg',
    '/mood/bold-modern-1.jpg',
    '/mood/bold-modern-2.jpg',
    '/mood/warm-organic-1.jpg',
    '/mood/premium-dark-1.jpg',
    '/mood/premium-dark-2.jpg',
    '/mood/playful-bright-1.jpg',
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
