import type { Metadata } from 'next'
import { listPublicBrands, getTotalBrandsCount } from '@/lib/brands'
import { FeedGallery, type FeedItem } from '@/components/landing/FeedGallery'
import { KoreanFeedGate } from '@/components/landing/KoreanFeedGate'

export const metadata: Metadata = {
  title: 'Atriium — 하나의 브랜드, 모든 채널',
  description: '로고 한 번 만들면 스마트스토어 썸네일, 인스타 포스트, 앱 아이콘, 명함까지 같은 DNA로 자동 변환. 벡터 SVG와 상업적 사용권 기본 포함.',
  keywords: ['로고 제작', 'AI 로고', '브랜드 디자인', '스마트스토어 썸네일', '1인 창업', '소상공인', 'Atriium'],
  openGraph: {
    title: 'Atriium — 하나의 브랜드, 모든 채널',
    description: '로고, 팔레트, 목업까지 10분. 벡터 SVG + 상업적 사용권 포함.',
    type: 'website',
    url: 'https://brandkit-wheat.vercel.app/ko',
    locale: 'ko_KR',
    siteName: 'Atriium',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Atriium — 하나의 브랜드, 모든 채널' }],
  },
  alternates: {
    canonical: 'https://brandkit-wheat.vercel.app/ko',
    languages: {
      'en-US': 'https://brandkit-wheat.vercel.app',
      'ko-KR': 'https://brandkit-wheat.vercel.app/ko',
    },
  },
}

export default async function KoreanHome() {
  const [publicBrands, totalCount] = await Promise.all([
    listPublicBrands(40),
    getTotalBrandsCount(),
  ])

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

  const showcaseImages = Array.from({ length: 14 }, (_, i) =>
    `/showcase/ref-${String(i + 1).padStart(2, '0')}.png`
  )
  const showcaseItems: FeedItem[] = showcaseImages.map((url, i) => ({
    id: `showcase-${i}`,
    imageUrl: url,
    brandName: '',
    brandId: '',
  }))

  const allItems = [...feedItems, ...showcaseItems]
  for (let i = allItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allItems[i], allItems[j]] = [allItems[j], allItems[i]]
  }

  return (
    <div className="relative -mt-8 -mb-8 -mx-4 md:left-1/2 md:-translate-x-1/2 md:w-screen">
      <FeedGallery items={allItems} initialBrandCount={publicBrands.length} />
      <KoreanFeedGate totalCount={totalCount} />
    </div>
  )
}
