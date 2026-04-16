'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen } from 'lucide-react'
import { BrandLibraryCard } from './BrandLibraryCard'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import type { SavedBrand } from '@/lib/brands'

interface Props {
  initialBrands: SavedBrand[]
}

export function BrandsList({ initialBrands }: Props) {
  const router = useRouter()
  const [brands, setBrands] = useState(initialBrands)
  const [pendingDelete, setPendingDelete] = useState<SavedBrand | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState<string | null>(null)

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
      // On error, just silently revert — the library page will reload state on next navigation
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {brands.map((brand) => (
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

      <DeleteConfirmModal
        open={pendingDelete !== null && !deleting}
        brandName={pendingDelete?.name ?? ''}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </>
  )
}
