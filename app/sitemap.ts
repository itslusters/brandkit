import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://brandkit-wheat.vercel.app'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]
}
