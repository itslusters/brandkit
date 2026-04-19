import type { MetadataRoute } from 'next'
import { listPublicBrands } from '@/lib/brands'

const BASE = 'https://brandkit-wheat.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/company`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Public brand share pages — picked from the gallery so new public brands
  // land in search engines automatically. Capped at 200 to keep the sitemap
  // lean; revisit if we need a brand-index crawler.
  let publicRoutes: MetadataRoute.Sitemap = []
  try {
    const brands = await listPublicBrands(200)
    publicRoutes = brands.map((b) => ({
      url: `${BASE}/share/${b.id}`,
      lastModified: new Date(b.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch (err) {
    console.error('[sitemap] failed to fetch public brands:', err)
  }

  return [...staticRoutes, ...publicRoutes]
}
