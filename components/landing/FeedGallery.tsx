'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

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
  /** How many brand-derived items the server initially rendered. The "Load
   *  more" button resumes fetching from this offset. */
  initialBrandCount?: number
}

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'organic', label: 'Organic' },
  { id: 'bold', label: 'Bold' },
  { id: 'tech', label: 'Tech' },
]

const LOAD_MORE_LIMIT = 40

/**
 * Savee/Pinterest-style 2–4 column masonry feed with a horizontal-scroll
 * filter row pinned to the top. Filter chips narrow to brands tagged with
 * the matching style pack — showcase images (no stylePack) always appear
 * so the grid never empties out. Below-the-fold pagination via a "Load
 * more" button that hits /api/public/brands/page.
 */
export function FeedGallery({ items, initialBrandCount = 40 }: Props) {
  const [filter, setFilter] = useState<string>('all')
  const [loaded, setLoaded] = useState<FeedItem[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(initialBrandCount)
  const [busy, setBusy] = useState(false)

  const combined = useMemo(() => [...items, ...loaded], [items, loaded])

  const filtered = useMemo(() => {
    if (filter === 'all') return combined
    return combined.filter((item) => !item.stylePack || item.stylePack === filter)
  }, [combined, filter])

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
              aria-pressed={filter === f.id}
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

      {nextOffset !== null && filter === 'all' && (
        <div className="flex justify-center py-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={busy}
            className="btn btn-secondary"
          >
            {busy ? <><Loader2 size={14} className="animate-spin" /> Loading…</> : 'Load more brands'}
          </button>
        </div>
      )}
    </div>
  )
}
