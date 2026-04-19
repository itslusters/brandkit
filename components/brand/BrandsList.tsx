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
      <div className="relative rounded-3xl border border-zinc-800/70 bg-zinc-900/30 overflow-hidden p-10 md:p-14 text-center">
        <div className="aurora-glow w-[400px] h-[260px] bg-blue-600/15 top-[-60px] left-[-60px]" style={{ animationDelay: '0s' }} />
        <div className="aurora-glow w-[360px] h-[240px] bg-violet-600/10 bottom-[-60px] right-[-60px]" style={{ animationDelay: '2s' }} />
        <div className="relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
            <FolderOpen size={22} className="text-zinc-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">
            Your shelf is empty.
          </h3>
          <p className="text-sm text-zinc-400 mt-1 mb-6 max-w-sm mx-auto leading-relaxed">
            Every brand you make — name, logo, palette, mockups — lives here. Generate one in ten minutes and it&apos;ll be waiting for you the next time you open Kiln.
          </p>
          <a href="/brand/new" className="btn btn-primary">
            Start your first brand →
          </a>
        </div>
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
