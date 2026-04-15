import type { StyleBrief } from '@/lib/types'

interface Props {
  brief: StyleBrief
}

export function StyleBriefDisplay({ brief }: Props) {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">추천 스타일</p>
        <p className="text-xl font-bold text-white">{brief.recommendedStyle}</p>
      </section>

      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">컬러 팔레트</p>
        <div className="flex gap-4">
          {brief.colorPalette.map((hex, idx) => (
            <div key={`${hex}-${idx}`} className="flex flex-col items-center gap-1.5">
              <div
                className="w-12 h-12 rounded-full border border-zinc-800"
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs text-zinc-500 tabular-nums">{hex}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">타이포그래피</p>
        <ul className="space-y-1">
          {brief.typography.map((t, idx) => (
            <li key={`${t}-${idx}`} className="text-sm text-zinc-300">{t}</li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">피해야 할 것</p>
        <ul className="space-y-1.5">
          {brief.avoidList.map((item, idx) => (
            <li key={`${item}-${idx}`} className="text-sm text-zinc-300 flex items-center gap-2">
              <span className="text-red-500 shrink-0">✕</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">무드 레퍼런스</p>
        <div className="grid grid-cols-3 gap-2">
          {brief.moodImages.map((id, idx) => (
            <img
              key={id}
              src={`/mood/${id}.jpg`}
              alt={`Mood reference ${idx + 1}`}
              className="rounded-lg aspect-video object-cover bg-zinc-900"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
