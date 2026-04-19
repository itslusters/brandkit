'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export interface FeedItem {
  id: string
  imageUrl: string
  brandName: string
  brandId: string
  stylePack?: string
}

interface Props {
  items: FeedItem[]
  /** How many brand-derived items the server initially rendered. Pagination
   *  resumes from this offset. */
  initialBrandCount?: number
}

const LOAD_MORE_LIMIT = 40

/**
 * Pinterest-style masonry feed with a "Load more" button at the bottom.
 * Filter chips were removed — they read as purpose-built for a larger
 * catalog than currently exists, and filtered grids fragmented the feed.
 */
export function FeedGallery({ items, initialBrandCount = 40 }: Props) {
  const [loaded, setLoaded] = useState<FeedItem[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(initialBrandCount)
  const [busy, setBusy] = useState(false)

  const combined = [...items, ...loaded]

  async function loadMore() {
    if (busy || nextOffset === null) return
    setBusy(true)
    try {
      const res = await fetch(`/api/public/brands/page?offset=${nextOffset}&limit=${LOAD_MORE_LIMIT}`)
      if (!res.ok) return
      const data = (await res.json()) as { items: FeedItem[]; nextOffset: number | null }
      setLoaded((prev) => [...prev, ...data.items])
      setNextOffset(data.nextOffset)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="pt-2">
      <div className="px-1 columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-1.5">
        {combined.map((item, i) => (
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

      {nextOffset !== null && (
        <div className="flex justify-center py-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={busy}
            className="btn btn-secondary"
          >
            {busy ? <><Loader2 size={14} className="animate-spin" /> Loading…</> : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
