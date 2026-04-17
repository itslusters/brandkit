'use client'
import { motion } from 'framer-motion'

interface FeedItem {
  id: string
  imageUrl: string
  brandName: string
  brandId: string
}

interface Props {
  items: FeedItem[]
}

// Savee/Pinterest-style 2-column masonry feed. Dense, visual-first.
// Each item links to the public brand page.
export function FeedGallery({ items }: Props) {
  return (
    <div className="px-1 pt-2">
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-1.5">
        {items.map((item, i) => (
          <motion.a
            key={item.id}
            href={item.brandId ? `/share/${item.brandId}` : '/brand/new'}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
            className="block break-inside-avoid mb-1.5 rounded-xl overflow-hidden group relative bg-zinc-900"
          >
            <img
              src={item.imageUrl}
              alt={item.brandName}
              loading="lazy"
              className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {/* Hover overlay — brand name (only for real brands) */}
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
