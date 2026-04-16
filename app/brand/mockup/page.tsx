'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MockupTemplateCard } from '@/components/brand/MockupTemplateCard'
import { MockupResultCard } from '@/components/brand/MockupResultCard'
import { DownloadActions } from '@/components/brand/DownloadActions'
import { MOCKUP_TEMPLATES, getTemplateById } from '@/lib/mockups'
import { getSession, setSession } from '@/lib/session'
import type { BrandInput, BrandResult, MockupResult } from '@/lib/types'

export default function MockupPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [recommendedIds, setRecommendedIds] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [results, setResults] = useState<MockupResult[] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Session guard — runs FIRST before any render that depends on session data
  useEffect(() => {
    const brandInput = getSession<BrandInput>('brandInput')
    const brandResult = getSession<BrandResult>('brandResult')
    const selectedName = getSession<string>('selectedName')
    const selectedLogoDataUrl = getSession<string>('selectedLogoDataUrl')
    if (!brandInput || !brandResult || !selectedName || !selectedLogoDataUrl) {
      router.replace('/brand/new')
      return
    }
    const recommended = brandResult.styleBrief.recommendedMockups ?? []
    const valid = recommended.filter((id) => getTemplateById(id))
    setRecommendedIds(valid)
    setSelectedIds(valid)

    const cached = getSession<MockupResult[]>('mockupResults')
    if (cached) setResults(cached)
    setReady(true)
  }, [router])

  function toggle(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function generateMockups() {
    const selectedLogoDataUrl = getSession<string>('selectedLogoDataUrl')
    if (!selectedLogoDataUrl || selectedIds.length === 0) return
    setGenerating(true)
    setHasError(false)
    setErrorMessage('')
    setResults(selectedIds.map((id) => ({ templateId: id, dataUrl: '' })))
    try {
      const res = await fetch('/api/brand/mockup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds: selectedIds, logoDataUrl: selectedLogoDataUrl }),
      })
      if (!res.ok) {
        setErrorMessage(`Server error ${res.status}`)
        setHasError(true)
        return
      }
      const data = await res.json() as { results: MockupResult[] }
      setResults(data.results)
      setSession('mockupResults', data.results)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed')
      setHasError(true)
    } finally {
      setGenerating(false)
    }
  }

  async function downloadBlob(apiPath: string, filename: string) {
    const brandResult = getSession<BrandResult>('brandResult')
    const brandName = getSession<string>('selectedName') ?? 'brand'
    const selectedLogoDataUrl = getSession<string>('selectedLogoDataUrl')
    if (!brandResult || !selectedLogoDataUrl) {
      setErrorMessage('Missing session data. Refresh and try again.')
      setHasError(true)
      return
    }
    const mockupTemplateIds = (results ?? []).filter((r) => r.dataUrl).map((r) => r.templateId)
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName, brandResult, selectedLogoDataUrl, mockupTemplateIds }),
    })
    if (!res.ok) {
      setErrorMessage(`Download failed: ${res.status}`)
      setHasError(true)
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
  }

  async function downloadPdf() {
    const brandName = getSession<string>('selectedName') ?? 'brand'
    await downloadBlob('/api/brand/guide/generate', `${brandName}-brand-guide.pdf`)
  }

  async function downloadZip() {
    const brandName = getSession<string>('selectedName') ?? 'brand'
    await downloadBlob('/api/brand/assets/generate', `${brandName}-brand-kit.zip`)
  }

  function downloadSingleMockup(r: MockupResult) {
    if (!r.dataUrl) return
    const a = document.createElement('a')
    a.href = r.dataUrl
    a.download = `${r.templateId}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!ready) return null

  const hasResults = results !== null && results.some((r) => r.dataUrl)

  return (
    <div className="pt-4 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pick your mockups</h1>
        <p className="text-zinc-500 text-sm mt-1">Select which mockups to generate. Recommended ones are marked.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MOCKUP_TEMPLATES.map((tpl, i) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <MockupTemplateCard
              template={tpl}
              selected={selectedIds.includes(tpl.id)}
              recommended={recommendedIds.includes(tpl.id)}
              onToggle={() => toggle(tpl.id)}
            />
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={generateMockups}
        disabled={selectedIds.length === 0 || generating}
        className="mt-6 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40"
      >
        {generating ? 'Generating…' : `Generate mockups (${selectedIds.length})`}
      </button>

      {hasError && (
        <div className="mt-6 text-center">
          <p className="text-zinc-500 text-sm">Something went wrong.</p>
          {errorMessage && <p className="text-zinc-600 text-xs mt-1 font-mono">{errorMessage}</p>}
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-white mb-3">Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {results.map((r) => {
              const tpl = getTemplateById(r.templateId)
              return (
                <MockupResultCard
                  key={r.templateId}
                  state={r.dataUrl ? 'result' : (generating ? 'skeleton' : 'error')}
                  dataUrl={r.dataUrl || undefined}
                  templateName={tpl?.name ?? r.templateId}
                  onDownload={() => downloadSingleMockup(r)}
                />
              )
            })}
          </div>
        </div>
      )}

      <DownloadActions
        disabled={!hasResults}
        onDownloadPdf={downloadPdf}
        onDownloadZip={downloadZip}
      />
    </div>
  )
}
