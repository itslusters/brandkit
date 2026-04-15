'use client'
import { TONE_KEYWORDS } from '@/lib/constants'

interface Props {
  selected: string[]
  onChange: (tones: string[]) => void
}

export function ToneSelector({ selected, onChange }: Props) {
  function toggle(tone: string) {
    if (selected.includes(tone)) {
      onChange(selected.filter(t => t !== tone))
    } else if (selected.length < 3) {
      onChange([...selected, tone])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-400 mb-2">
        Brand tone <span className="text-zinc-600">(pick 3)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {TONE_KEYWORDS.map(tone => {
          const active = selected.includes(tone)
          return (
            <button
              key={tone}
              type="button"
              onClick={() => toggle(tone)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                active
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              {tone}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-zinc-600 mt-2">{selected.length}/3 selected</p>
    </div>
  )
}
