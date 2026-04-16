'use client'
import { motion } from 'framer-motion'
import { Trash2, Copy } from 'lucide-react'
import type { SavedBrand } from '@/lib/brands'

interface Props {
  brand: SavedBrand
  onDelete: () => void
  onDuplicate: () => void
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function BrandLibraryCard({ brand, onDelete, onDuplicate }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ scale: 1.015 }}
      className="group relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden hover:border-zinc-600 transition-colors"
    >
      <a href={`/brand/saved/${brand.id}`} className="block">
        {/* Logo thumbnail */}
        <div className="aspect-[4/3] bg-white border-b border-zinc-800 flex items-center justify-center p-4">
          <img
            src={brand.selectedLogoUrl}
            alt={brand.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Mockup preview strip */}
        {brand.mockupUrls.length > 0 && (
          <div className="flex border-b border-zinc-800 bg-zinc-900/40">
            {brand.mockupUrls.slice(0, 3).map((m) => (
              <div key={m.templateId} className="flex-1 aspect-square overflow-hidden">
                <img
                  src={m.url}
                  alt=""
                  aria-hidden
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-white truncate">{brand.name}</h3>
          <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
            <span className="truncate">{brand.industry}</span>
            <span className="shrink-0 ml-2 tabular-nums">{timeAgo(brand.createdAt)}</span>
          </div>
        </div>
      </a>

      {/* Duplicate (appears on hover, mobile = always faintly visible) */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDuplicate() }}
        aria-label="Duplicate brand"
        className="absolute top-2 right-12 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-zinc-400 flex items-center justify-center opacity-50 sm:opacity-0 group-hover:opacity-100 hover:text-blue-400 hover:bg-black/80 transition-all"
      >
        <Copy size={14} />
      </button>

      {/* Delete (appears on hover, mobile = always faintly visible) */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete() }}
        aria-label="Delete brand"
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-zinc-400 flex items-center justify-center opacity-50 sm:opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-black/80 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  )
}
