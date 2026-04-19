'use client'
import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Props {
  open: boolean
  brandId: string
  currentName: string
  onRenamed: (newName: string) => void
  onClose: () => void
}

export function RenameBrandModal({ open, brandId, currentName, onRenamed, onClose }: Props) {
  const [name, setName] = useState(currentName)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(currentName)
      setError('')
    }
  }, [open, currentName])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = name.trim()
    if (!next) { setError('Name cannot be empty.'); return }
    if (next === currentName) { onClose(); return }
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/brands/${brandId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: next }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { message?: string }
        setError(j.message ?? 'Rename failed.')
        return
      }
      onRenamed(next)
    } catch {
      setError('Network error.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
        <Pencil size={18} className="text-zinc-300" />
      </div>
      <p className="eyebrow mb-3">Rename brand</p>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight mb-2">
        Give it a better name.
      </h2>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
        Only the display name changes — the logo, mockups, and brand memory
        stay exactly as they are.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          maxLength={80}
          className="input"
          placeholder="Brand name"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn btn-secondary btn-full sm:flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="btn btn-primary btn-full sm:flex-1"
          >
            {busy ? 'Saving…' : 'Save name'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
