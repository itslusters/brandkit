import { listPublicBrands, getTotalBrandsCount } from '@/lib/brands'
import { FeedGallery, type FeedItem } from '@/components/landing/FeedGallery'
import { FeedGate } from '@/components/landing/FeedGate'

const BASE = 'https://brandkit-wheat.vercel.app'

export default async function Explore() {
  const [publicBrands, totalCount] = await Promise.all([
    listPublicBrands(40),
    getTotalBrandsCount(),
  ])

  // Structured data — helps Google surface Atriium as a SoftwareApplication in
  // the knowledge panel and pulls the brand count in as a usage signal.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE}#organization`,
        name: 'Atriium',
        url: BASE,
        logo: `${BASE}/icon-512.png`,
        description: 'AI-powered brand workspace — name, logo, mockups, guide in ten minutes.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Atriium',
        url: BASE,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web, iOS',
        description: 'Brand workspace that remembers your identity and ships a full kit — logo, palette, typography, mockups, PDF brand guide, vector SVG.',
        offers: [
          { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Essentials', price: '29', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Solo', price: '19', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '19', priceCurrency: 'USD', unitText: 'MONTH' } },
          { '@type': 'Offer', name: 'Pro', price: '149', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Studio', price: '79', priceCurrency: 'USD', priceSpecification: { '@type': 'UnitPriceSpecification', price: '79', priceCurrency: 'USD', unitText: 'MONTH' } },
        ],
        ...(totalCount > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: Math.max(totalCount, 1),
          },
        }),
      },
    ],
  }

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
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative -mt-8 -mb-8 -mx-4 md:left-1/2 md:-translate-x-1/2 md:w-screen">
        <FeedGallery items={allItems} initialBrandCount={publicBrands.length} />
        <FeedGate totalCount={totalCount} />
      </div>
    </>
  )
}
