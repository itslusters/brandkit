'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, FileText, Package, Copy } from 'lucide-react'
import { StyleBriefDisplay } from '@/components/brand/StyleBriefDisplay'
import { ShareToggle } from './ShareToggle'
import type { SavedBrand } from '@/lib/brands'

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(blob)
  })
}

interface Props {
  brand: SavedBrand
}

export function SavedBrandView({ brand }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<'pdf' | 'zip' | null>(null)
  const [error, setError] = useState('')
  const [duplicating, setDuplicating] = useState(false)
  const [duplicateError, setDuplicateError] = useState('')

  async function downloadAsset(kind: 'pdf' | 'zip') {
    setBusy(kind)
    setError('')
    try {
      // Convert Blob URLs back to data URLs for the existing API routes
      const selectedLogoDataUrl = await urlToDataUrl(brand.selectedLogoUrl)

      // Re-fetch mockups so the routes can recompose if needed (route signature uses templateIds)
      const mockupTemplateIds = brand.mockupUrls.map((m) => m.templateId)

      const apiPath = kind === 'pdf' ? '/api/brand/guide/generate' : '/api/brand/assets/generate'
      const filename = kind === 'pdf' ? `${brand.name}-brand-guide.pdf` : `${brand.name}-brand-kit.zip`

      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brand.name,
          brandResult: brand.brandResult,
          selectedLogoDataUrl,
          mockupTemplateIds,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { message?: string; error?: string }
        setError(`Download failed (${res.status}): ${j.message ?? j.error ?? 'unknown'}`)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setBusy(null)
    }
  }

  async function duplicate() {
    setDuplicating(true)
    setDuplicateError('')
    try {
      const res = await fetch(`/api/brands/${brand.id}/duplicate`, { method: 'POST' })
      if (res.ok) {
        const { brand: cloned } = await res.json() as { brand: { id: string } }
        router.push(`/brand/saved/${cloned.id}`)
        return
      }
      const j = await res.json().catch(() => ({})) as { message?: string }
      setDuplicateError(j.message ?? 'Could not duplicate.')
    } catch {
      setDuplicateError('Network error.')
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <div className="pt-4 pb-12">
      <div className="mb-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Saved brand</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">{brand.name}</h1>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl bg-white p-8 mb-6 flex items-center justify-center"
      >
        <img src={brand.selectedLogoUrl} alt={brand.name} className="max-h-32 object-contain" />
      </motion.div>

      <StyleBriefDisplay brief={brand.brandResult.styleBrief} />

      {/* Mockups */}
      {brand.mockupUrls.length > 0 && (
        <section className="mt-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Mockups</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {brand.mockupUrls.map((m) => (
              <a
                key={m.templateId}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="block aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <img src={m.url} alt={m.templateId} className="w-full h-full object-contain" />
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <ShareToggle brandId={brand.id} initialPublic={brand.public ?? false} />
      </div>

      {/* Re-download actions */}
      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={() => downloadAsset('pdf')}
          disabled={busy !== null}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40"
        >
          <FileText size={16} />
          {busy === 'pdf' ? 'Generating…' : 'Download Brand Guide (PDF)'}
        </button>
        <button
          type="button"
          onClick={() => downloadAsset('zip')}
          disabled={busy !== null}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 text-zinc-200 font-semibold text-sm disabled:opacity-40"
        >
          <Package size={16} />
          {busy === 'zip' ? 'Packaging…' : 'Download Asset Pack (ZIP)'}
        </button>
        <a
          href={brand.selectedLogoUrl}
          download={`${brand.name}-logo.png`}
          target="_blank"
          rel="noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-medium text-sm hover:text-zinc-200 hover:border-zinc-600 transition-colors"
        >
          <Download size={16} />
          Logo PNG
        </a>
        <button
          type="button"
          onClick={duplicate}
          disabled={duplicating}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-medium text-sm hover:text-zinc-200 hover:border-zinc-600 transition-colors disabled:opacity-40"
        >
          <Copy size={16} />
          {duplicating ? 'Duplicating…' : 'Duplicate brand'}
        </button>
        {duplicateError && <p className="text-xs text-red-400">{duplicateError}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}
