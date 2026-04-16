'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Search, ArrowDownUp } from 'lucide-react'
import { BrandLibraryCard } from './BrandLibraryCard'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import type { SavedBrand } from '@/lib/brands'

type SortMode = 'recent' | 'oldest' | 'name'

const SORT_LABEL: Record<SortMode, string> = {
  recent: 'Newest',
  oldest: 'Oldest',
  name: 'Name A–Z',
}

interface Props {
  initialBrands: SavedBrand[]
}

export function BrandsList({ initialBrands }: Props) {
  const router = useRouter()
  const [brands, setBrands] = useState(initialBrands)
  const [pendingDelete, setPendingDelete] = useState<SavedBrand | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('recent')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? brands.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.industry.toLowerCase().includes(q)
        )
      : brands
    const sorted = [...list]
    if (sort === 'recent') sorted.sort((a, b) => b.createdAt - a.createdAt)
    else if (sort === 'oldest') sorted.sort((a, b) => a.createdAt - b.createdAt)
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [brands, query, sort])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const id = pendingDelete.id
    try {
      const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBrands((prev) => prev.filter((b) => b.id !== id))
      }
    } finally {
      setDeleting(false)
      setPendingDelete(null)
    }
  }

  async function duplicate(brandId: string) {
    if (duplicating) return
    setDuplicating(brandId)
    try {
      const res = await fetch(`/api/brands/${brandId}/duplicate`, { method: 'POST' })
      if (res.ok) {
        const { brand } = await res.json() as { brand: { id: string } }
        router.push(`/brand/saved/${brand.id}`)
        return
      }
    } finally {
      setDuplicating(null)
    }
  }

  if (brands.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-zinc-900 flex items-center justify-center mb-4">
          <FolderOpen size={24} className="text-zinc-600" />
        </div>
        <p className="text-base text-white font-medium">No brands yet</p>
        <p className="text-sm text-zinc-500 mt-1 mb-5 max-w-xs mx-auto">
          Generate a brand and reach the mockup step — we&apos;ll save it here automatically.
        </p>
        <a
          href="/brand/new"
          className="inline-flex items-center justify-center bg-white text-zinc-950 px-5 py-2.5 rounded-md font-medium hover:bg-zinc-200 transition-colors"
        >
          Create your first brand →
        </a>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar: search + sort */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or industry"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        <div className="relative shrink-0">
          <ArrowDownUp size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Sort brands"
            className="appearance-none pl-9 pr-8 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors cursor-pointer"
          >
            {(Object.keys(SORT_LABEL) as SortMode[]).map((m) => (
              <option key={m} value={m}>{SORT_LABEL[m]}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-12">
          No brands match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((brand) => (
              <motion.div
                key={brand.id}
                layout
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
              >
                <BrandLibraryCard
                  brand={brand}
                  onDelete={() => setPendingDelete(brand)}
                  onDuplicate={() => duplicate(brand.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <DeleteConfirmModal
        open={pendingDelete !== null && !deleting}
        brandName={pendingDelete?.name ?? ''}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  )
}
