'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { MockupTemplateCard } from '@/components/brand/MockupTemplateCard'
import { MockupResultCard } from '@/components/brand/MockupResultCard'
import { DownloadActions } from '@/components/brand/DownloadActions'
import { UpgradeModal } from '@/components/UpgradeModal'
import { WaitlistModal } from '@/components/WaitlistModal'
import { MOCKUP_TEMPLATES, getTemplateById } from '@/lib/mockups'
import { getSession, setSession } from '@/lib/session'
import { SavedBadge } from '@/components/brand/SavedBadge'
import type { BrandInput, BrandResult, MockupResult, LogoType } from '@/lib/types'

export default function MockupPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [recommendedIds, setRecommendedIds] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [results, setResults] = useState<MockupResult[] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { user } = useUser()
  const userTier = ((user?.publicMetadata as { tier?: 'free' | 'essentials' | 'solo' | 'pro' | 'studio' } | undefined)?.tier) ?? 'free'
  const isFreeTier = userTier === 'free'
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [waitlistPlan, setWaitlistPlan] = useState<'essentials' | 'pro' | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'limit' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState<string>('')

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

    setReady(true)
  }, [router])

  // Auto-save when mockup generation completes (signed-in users only, once per session)
  useEffect(() => {
    if (saveState !== 'idle') return
    if (!user) return
    if (!results || results.length === 0) return
    const successful = results.filter((r) => r.dataUrl)
    if (successful.length === 0) return

    const brandResult = getSession<BrandResult>('brandResult')
    const brandName = getSession<string>('selectedName')
    const selectedLogoDataUrl = getSession<string>('selectedLogoDataUrl')
    const logoType = getSession<LogoType>('logoType')
    if (!brandResult || !brandName || !selectedLogoDataUrl || !logoType) return

    setSaveState('saving')
    // Send only template IDs (not full data URLs) to stay under Vercel's 4.5MB body limit.
    // Server will regenerate mockups from the logo + template IDs.
    const mockupTemplateIds = successful.map((r) => r.templateId)
    fetch('/api/brands/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: brandName,
        brandInput: getSession<BrandInput>('brandInput'),
        brandResult,
        selectedLogoDataUrl,
        selectedLogoType: logoType,
        mockupTemplateIds,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          setSaveState('saved')
          // Confetti celebration on first brand save
          import('canvas-confetti').then(({ default: confetti }) => {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ['#ffffff', '#a1a1aa', '#3b82f6'] })
          })
          return
        }
        if (res.status === 402) {
          const j = await res.json().catch(() => ({})) as { message?: string }
          setSaveMessage(j.message ?? 'Free tier limit reached')
          setSaveState('limit')
          return
        }
        setSaveState('error')
      })
      .catch(() => setSaveState('error'))
  }, [user, results, saveState])

  function toggle(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function generateMockups() {
    // Free tier can't generate — short-circuit into the upgrade modal before
    // we hit the server. Server also enforces this (403) as defense in depth.
    if (isFreeTier) {
      setUpgradeOpen(true)
      return
    }
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
      if (res.status === 403) {
        setResults(null)
        setUpgradeOpen(true)
        return
      }
      if (!res.ok) {
        setErrorMessage(`Server error ${res.status}`)
        setHasError(true)
        return
      }
      const data = await res.json() as { results: MockupResult[] }
      setResults(data.results)
      // Don't store in sessionStorage — base64 data URLs exceed 5MB quota
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
    if (res.status === 403) {
      setUpgradeOpen(true)
      return
    }
    if (!res.ok) {
      let detail = ''
      try {
        const j = await res.json() as { message?: string; error?: string }
        detail = j.message ?? j.error ?? ''
      } catch {
        detail = await res.text().catch(() => '')
      }
      setErrorMessage(`Download failed (${res.status}): ${detail}`)
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
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pick your mockups</h1>
          <p className="text-zinc-500 text-sm mt-1">Select which mockups to generate. Recommended ones are marked.</p>
        </div>
        <div className="shrink-0 pt-1">
          <SavedBadge state={saveState} message={saveMessage} />
        </div>
      </div>

      {isFreeTier && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
            🔒
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Mockups are an Essentials feature</p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              See your logo on business cards, packaging, apps, and more. One-time $29 or $19/mo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="shrink-0 text-xs font-semibold text-white underline decoration-zinc-500 hover:decoration-white"
          >
            Upgrade
          </button>
        </motion.div>
      )}

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
        className="btn btn-primary btn-full btn-lg mt-6"
      >
        {generating
          ? 'Generating…'
          : isFreeTier
            ? `Unlock mockups — upgrade`
            : `Generate mockups (${selectedIds.length})`}
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

      {/* Share & DNA Card — visible after save success */}
      {saveState === 'saved' && (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={async () => {
              const brandResult = getSession<BrandResult>('brandResult')
              const brandName = getSession<string>('selectedName') ?? 'brand'
              if (!brandResult) return
              const res = await fetch('/api/brand/dna-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ brandName, brandResult }),
              })
              if (!res.ok) return
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${brandName}-dna-card.png`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border border-zinc-700 text-zinc-200 font-medium text-sm hover:border-zinc-500 transition-colors"
          >
            ✨ Download DNA Card (1080×1080)
          </button>
          <a
            href="/account/brands"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border border-zinc-800 text-zinc-400 font-medium text-sm hover:text-zinc-200 hover:border-zinc-600 transition-colors"
          >
            View in library → (share from there)
          </a>
        </div>
      )}

      <UpgradeModal
        open={upgradeOpen}
        reason="Mockups are part of Essentials and above — see your logo on business cards, packaging, apps, and more. You also unlock vector SVG, PDF guide, and the full asset pack."
        onClose={() => setUpgradeOpen(false)}
        onChoosePlan={(plan) => { setUpgradeOpen(false); setWaitlistPlan(plan) }}
      />
      <WaitlistModal
        open={waitlistPlan !== null}
        plan={waitlistPlan ?? 'essentials'}
        prefilledEmail={user?.primaryEmailAddress?.emailAddress ?? ''}
        onClose={() => setWaitlistPlan(null)}
      />
    </div>
  )
}
