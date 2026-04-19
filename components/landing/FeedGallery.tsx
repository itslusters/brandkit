'use client'
import { motion } from 'framer-motion'

export interface FeedItem {
  id: string
  imageUrl: string
  brandName: string
  brandId: string
  stylePack?: string
}

interface Props {
  items: FeedItem[]
  /** Retained for backwards compatibility with page.tsx; unused since we ship
   *  the full gallery inline. */
  initialBrandCount?: number
}

/**
 * Pinterest-style masonry feed. Server renders the entire public gallery
 * plus a curated showcase set. No pagination — scrolling IS the browse.
 */
export function FeedGallery({ items }: Props) {
  return (
    <div className="pt-2">
      <div className="px-1 columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-1.5">
        {items.map((item, i) => (
          <motion.a
            key={item.id}
            href={item.brandId ? `/share/${item.brandId}` : '/brand/new'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
            className="block break-inside-avoid mb-1.5 rounded-xl overflow-hidden group relative bg-zinc-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.brandName}
              loading="lazy"
              className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {item.brandName && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                <span className="text-sm font-medium text-white">{item.brandName}</span>
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </div>
  )
}
