'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, FileText, Package, Copy, Sparkles } from 'lucide-react'
import { BrandArtifact } from './BrandArtifact'
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
      const selectedLogoDataUrl = await urlToDataUrl(brand.selectedLogoUrl)
      const mockupUrls = brand.mockupUrls
      const apiPath = kind === 'pdf' ? '/api/brand/guide/generate' : '/api/brand/assets/generate'
      const filename = kind === 'pdf' ? `${brand.name}-brand-guide.pdf` : `${brand.name}-brand-kit.zip`

      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brand.name,
          brandResult: brand.brandResult,
          selectedLogoDataUrl,
          mockupUrls,
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

  async function downloadDnaCard() {
    const res = await fetch('/api/brand/dna-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName: brand.name, brandResult: brand.brandResult }),
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${brand.name}-dna-card.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <BrandArtifact
      brand={brand}
      eyebrow="Saved brand"
      actions={
        <div className="space-y-6">
          <ShareToggle brandId={brand.id} initialPublic={brand.public ?? false} />

          <div>
            <p className="eyebrow mb-4">Downloads</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => downloadAsset('pdf')}
                disabled={busy !== null}
                className="btn btn-primary btn-full"
              >
                <FileText size={16} />
                {busy === 'pdf' ? 'Generating…' : 'Brand Guide (PDF)'}
              </button>
              <button
                type="button"
                onClick={() => downloadAsset('zip')}
                disabled={busy !== null}
                className="btn btn-secondary btn-full"
              >
                <Package size={16} />
                {busy === 'zip' ? 'Packaging…' : 'Asset Pack (ZIP)'}
              </button>
              <a
                href={brand.selectedLogoUrl}
                download={`${brand.name}-logo.png`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-full"
              >
                <Download size={16} />
                Logo PNG
              </a>
              <button
                type="button"
                onClick={downloadDnaCard}
                className="btn btn-secondary btn-full"
              >
                <Sparkles size={16} />
                DNA Card
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={duplicate}
              disabled={duplicating}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Copy size={14} />
              {duplicating ? 'Duplicating…' : 'Duplicate this brand'}
            </button>
          </div>

          {(error || duplicateError) && (
            <p className="text-xs text-red-400">{error || duplicateError}</p>
          )}
        </div>
      }
    />
  )
}
