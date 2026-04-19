import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Sparkles, ArrowRight } from 'lucide-react'
import { getPublicBrand } from '@/lib/brands'
import { BrandArtifact } from '@/components/brand/BrandArtifact'

interface Params { params: { id: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const brand = await getPublicBrand(params.id)
  if (!brand) return { title: 'Brand not found' }
  return {
    title: `${brand.name} — made with Atriium`,
    description: brand.brandResult.styleBrief.recommendedStyle,
    openGraph: {
      title: `${brand.name}`,
      description: `Forged on Atriium — ${brand.brandResult.styleBrief.recommendedStyle}`,
      type: 'website',
    },
  }
}

export default async function SharedBrandPage({ params }: Params) {
  const brand = await getPublicBrand(params.id)
  if (!brand) notFound()

  const remixHref = `/brand/new?remix=${brand.id}&industry=${encodeURIComponent(brand.industry)}&tones=${encodeURIComponent(brand.brandInput.tones.join(','))}&stylePack=${brand.brandInput.stylePack ?? ''}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: brand.name,
    description: brand.brandResult.styleBrief.recommendedStyle,
    image: brand.selectedLogoUrl,
    dateCreated: new Date(brand.createdAt).toISOString(),
    dateModified: new Date(brand.updatedAt).toISOString(),
    creator: { '@type': 'Organization', name: 'Atriium', url: 'https://brandkit-wheat.vercel.app' },
    genre: brand.industry,
    keywords: brand.brandInput.tones.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <BrandArtifact
      brand={brand}
      eyebrow="Shared brand"
      ribbon={
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm rounded-full px-3 py-1.5"
        >
          Made with <span className="text-white">Atriium</span>
        </a>
      }
      actions={
        <div className="space-y-8">
          {/* Conversion block — the whole point of the share page */}
          <div className="relative rounded-3xl border border-zinc-800/70 bg-zinc-900/40 overflow-hidden p-6 md:p-8">
            <div className="aurora-glow w-[500px] h-[300px] bg-blue-600/15 top-[-80px] left-[-80px]" style={{ animationDelay: '0s' }} />
            <div className="aurora-glow w-[400px] h-[300px] bg-violet-600/10 bottom-[-80px] right-[-80px]" style={{ animationDelay: '2s' }} />

            <div className="relative">
              <p className="eyebrow mb-3">Your turn</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight mb-2">
                Ten minutes, and your brand is here too.
              </h2>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                Atriium remembers your brand — colors, type, tone — so every future asset builds on the same DNA. Start free.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a href={remixHref} className="btn btn-primary">
                  <Sparkles size={15} /> Remix this one
                </a>
                <a href="/brand/new" className="btn btn-secondary">
                  Start from scratch <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </div>

          {/* Lightweight nav — user may want to see more */}
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
            <a href="/" className="hover:text-zinc-200 transition-colors">More brands</a>
            <span className="text-zinc-800">·</span>
            <a href="/pricing" className="hover:text-zinc-200 transition-colors">Pricing</a>
            <span className="text-zinc-800">·</span>
            <a href="/company" className="hover:text-zinc-200 transition-colors">About Atriium</a>
          </div>
        </div>
      }
    />
    </>
  )
}
