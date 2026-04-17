'use client'
import { motion } from 'framer-motion'
import type { SavedBrand } from '@/lib/brands'

interface Props {
  brands: SavedBrand[]
}

// Savee-style dense masonry grid. Each card shows the logo on white bg.
// Hover reveals brand name + "Made with BrandKit".
// Variable padding per card for visual variety.
const PADDING_VARIANTS = ['p-6', 'p-8', 'p-10', 'p-12', 'p-14']

export function CommunityGallery({ brands }: Props) {
  if (brands.length === 0) return null

  return (
    <section className="relative -mx-4 md:left-1/2 md:-translate-x-1/2 md:w-screen">
      <div className="px-1">
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-1.5">
          {brands.map((brand, i) => {
            const pad = PADDING_VARIANTS[i % PADDING_VARIANTS.length]
            const hasMockups = brand.mockupUrls.length > 0
            // Alternate between showing logo and showing first mockup for visual variety
            const showMockup = hasMockups && i % 3 === 2

            return (
              <motion.a
                key={brand.id}
                href={`/share/${brand.id}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: (i % 5) * 0.05 }}
                className="block break-inside-avoid mb-1.5 rounded-xl overflow-hidden group relative"
              >
                {showMockup ? (
                  <img
                    src={brand.mockupUrls[0].url}
                    alt={brand.name}
                    className="w-full object-cover bg-zinc-900"
                  />
                ) : (
                  <div className={`bg-white ${pad} flex items-center justify-center`}>
                    <img
                      src={brand.selectedLogoUrl}
                      alt={brand.name}
                      className="w-full object-contain max-h-40"
                    />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-200 flex items-end p-3 opacity-0 group-hover:opacity-100">
                  <div>
                    <p className="text-sm font-semibold text-white">{brand.name}</p>
                    <p className="text-[10px] text-zinc-400">{brand.industry}</p>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
