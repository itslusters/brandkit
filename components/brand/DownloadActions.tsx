'use client'
import { useState } from 'react'

interface Props {
  disabled: boolean
  onDownloadPdf: () => Promise<void>
  onDownloadZip: () => Promise<void>
}

export function DownloadActions({ disabled, onDownloadPdf, onDownloadZip }: Props) {
  const [busyPdf, setBusyPdf] = useState(false)
  const [busyZip, setBusyZip] = useState(false)

  async function wrap(setBusy: (v: boolean) => void, fn: () => Promise<void>) {
    setBusy(true)
    try { await fn() } finally { setBusy(false) }
  }

  return (
    <div className="mt-8 space-y-3">
      <button
        type="button"
        disabled={disabled || busyPdf}
        onClick={() => wrap(setBusyPdf, onDownloadPdf)}
        className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm disabled:opacity-40"
      >
        {busyPdf ? 'Generating…' : 'Download Brand Guide (PDF)'}
      </button>
      <button
        type="button"
        disabled={disabled || busyZip}
        onClick={() => wrap(setBusyZip, onDownloadZip)}
        className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-200 font-semibold text-sm disabled:opacity-40"
      >
        {busyZip ? 'Packaging…' : 'Download Asset Pack (ZIP)'}
      </button>
    </div>
  )
}
