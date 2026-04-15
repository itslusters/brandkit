'use client'
import { Check } from 'lucide-react'
import type { NamingCandidate } from '@/lib/types'

interface Props {
  candidate: NamingCandidate
  selected: boolean
  onSelect: (name: string) => void
}

export function NamingCard({ candidate, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(candidate.name)}
      className={`w-full text-left rounded-xl border p-4 transition-colors duration-200 ${
        selected
          ? 'border-white bg-zinc-900'
          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-white">{candidate.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{candidate.rationale}</p>
        </div>
        {selected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <Check size={11} className="text-black" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  )
}
