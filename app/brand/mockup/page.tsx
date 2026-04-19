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
import { trackEvent } from '@/lib/analytics'
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

  // Auto-save when the page is ready. Paid users auto-save once mockups come
  // back; free users auto-save immediately with an empty mockupUrls list,
  // since mockup generation is paywalled for them.
  useEffect(() => {
    if (saveState !== 'idle') return
    if (!user || !ready) return

    const paidWithoutMockups = !isFreeTier && (!results || results.filter((r) => r.url).length === 0)
    if (paidWithoutMockups) return // wait for mockup generation

    const brandResult = getSession<BrandResult>('brandResult')
    const brandName = getSession<string>('selectedName')
    const selectedLogoDataUrl = getSession<string>('selectedLogoDataUrl')
    const logoType = getSession<LogoType>('logoType')
    const brandInput = getSession<BrandInput>('brandInput')
    if (!brandResult || !brandName || !selectedLogoDataUrl || !logoType || !brandInput) return

    const successful = results?.filter((r) => r.url) ?? []

    setSaveState('saving')
    setSaveMessage('')

    // Strip the (potentially large) referencePhoto base64 from the body —
    // combined with the logo PNG it can push the JSON past Vercel's 4.5MB
    // serverless body limit. The photo is non-critical for save.
    const { referencePhotoDataUrl: _photo, ...trimmedInput } = brandInput

    // Each mockup already carries a persistent Blob URL from the mockup
    // generation route. Passing those instead of the base64 dataUrls keeps
    // the save payload slim and means guide/ZIP downloads can fetch from
    // Blob directly instead of regenerating Recraft images.
    const mockupUrls = successful
      .map((r) => ({ templateId: r.templateId, url: r.url as string }))

    fetch('/api/brands/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: brandName,
        brandInput: trimmedInput,
        brandResult,
        selectedLogoDataUrl,
        selectedLogoType: logoType,
        mockupUrls,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          setSaveState('saved')
          trackEvent('brand_save_success', { tier: userTier, mockup_count: mockupUrls.length })
          import('canvas-confetti').then(({ default: confetti }) => {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ['#ffffff', '#a1a1aa', '#3b82f6'] })
          })
          return
        }
        // Surface whatever the server said so the badge can display a real reason.
        let detail = ''
        try {
          const j = await res.json() as { message?: string; error?: string }
          detail = j.message ?? j.error ?? ''
        } catch {
          detail = await res.text().catch(() => '')
        }
        if (res.status === 402) {
          setSaveMessage(detail || 'Free tier limit reached')
          setSaveState('limit')
          trackEvent('brand_save_fail', { reason: 'limit_reached', status: res.status })
          return
        }
        setSaveMessage(detail || `Save failed (${res.status})`)
        setSaveState('error')
        trackEvent('brand_save_fail', { reason: 'server_error', status: res.status })
      })
      .catch((err) => {
        setSaveMessage(err instanceof Error ? err.message : 'Network error')
        setSaveState('error')
        trackEvent('brand_save_fail', { reason: 'network_error' })
      })
  }, [user, results, saveState, ready, isFreeTier])

  function toggle(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function generateMockups() {
    const brandName = getSession<string>('selectedName')
    const brandResult = getSession<BrandResult>('brandResult')
    if (!brandName || !brandResult || selectedIds.length === 0) return
    setGenerating(true)
    setHasError(false)
    setErrorMessage('')
    setResults(selectedIds.map((id) => ({ templateId: id, dataUrl: '' })))
    try {
      const res = await fetch('/api/brand/mockup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds: selectedIds, brandName, brandResult }),
      })
      if (!res.ok) {
        setErrorMessage(`Server error ${res.status}`)
        setHasError(true)
        return
      }
      const data = await res.json() as { results: MockupResult[] }
      setResults(data.results)
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
    const mockupUrls = (results ?? [])
      .filter((r) => r.url)
      .map((r) => ({ templateId: r.templateId, url: r.url as string }))
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName, brandResult, selectedLogoDataUrl, mockupUrls }),
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
          <h1 className="text-xl font-bold">Pick your mockups</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isFreeTier
              ? 'Mockups are an Essentials feature. Your brand will still be saved so you can upgrade and generate later.'
              : 'Select which mockups to generate. Recommended ones are marked.'}
          </p>
        </div>
        <div className="shrink-0 pt-1 flex items-center gap-2">
          <SavedBadge state={saveState} message={saveMessage} />
          {saveState === 'error' && (
            <button
              type="button"
              onClick={() => { setSaveMessage(''); setSaveState('idle') }}
              className="text-xs text-zinc-400 hover:text-white underline decoration-zinc-600"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {isFreeTier && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-4 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 text-sm">
            🔒
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Mockups are on Essentials and above</p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              See your brand rendered on business cards, apps, packaging, and more. Auto-saved brand stays in your library either way.
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
              onToggle={() => isFreeTier ? setUpgradeOpen(true) : toggle(tpl.id)}
            />
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={isFreeTier ? () => setUpgradeOpen(true) : generateMockups}
        disabled={!isFreeTier && (selectedIds.length === 0 || generating)}
        className="btn btn-primary btn-full btn-lg mt-6"
      >
        {generating
          ? 'Generating…'
          : isFreeTier
            ? 'Unlock mockups — upgrade'
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
                  errorMessage={r.error}
                  watermarked={isFreeTier}
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-10 rounded-3xl border border-zinc-800/70 bg-zinc-900/40 overflow-hidden p-6 md:p-8"
        >
          <div className="aurora-glow w-[420px] h-[260px] bg-emerald-600/15 top-[-60px] left-[-60px]" style={{ animationDelay: '0s' }} />
          <div className="aurora-glow w-[380px] h-[240px] bg-blue-600/10 bottom-[-60px] right-[-60px]" style={{ animationDelay: '2s' }} />
          <div className="relative">
            <p className="eyebrow mb-2">Saved to your library</p>
            <h3 className="text-lg font-bold text-white leading-tight mb-2">
              Share what you just made.
            </h3>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed mb-5">
              Download the DNA Card for social, or open your library to get a
              public share link.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
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
                className="btn btn-primary"
              >
                ✨ Download DNA Card
              </button>
              <a href="/account/brands" className="btn btn-secondary">
                View in library →
              </a>
            </div>
          </div>
        </motion.div>
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
