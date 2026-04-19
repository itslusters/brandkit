'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface FeedItem {
  id: string
  imageUrl: string
  brandName: string
  brandId: string
  /** Optional style pack the brand was built with — used for filtering. */
  stylePack?: string
}

interface Props {
  items: FeedItem[]
}

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'organic', label: 'Organic' },
  { id: 'bold', label: 'Bold' },
  { id: 'tech', label: 'Tech' },
]

/**
 * Savee/Pinterest-style 2–4 column masonry feed with a horizontal-scroll
 * filter row pinned to the top. Filter chips narrow to brands tagged with
 * the matching style pack — showcase images (no stylePack) always appear
 * so the grid never empties out.
 */
export function FeedGallery({ items }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((item) => !item.stylePack || item.stylePack === filter)
  }, [items, filter])

  return (
    <div className="pt-2">
      {/* Filter row */}
      <div className="sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-20 -mx-0.5 mb-2 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 px-3 pb-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f.id
                  ? 'bg-white text-zinc-950 shadow-lg shadow-white/10'
                  : 'bg-zinc-900/70 text-zinc-400 border border-zinc-800/70 backdrop-blur-sm hover:text-white hover:border-zinc-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-1 columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-1.5">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.a
              key={item.id}
              href={item.brandId ? `/share/${item.brandId}` : '/brand/new'}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
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
        </AnimatePresence>
      </div>
    </div>
  )
}
