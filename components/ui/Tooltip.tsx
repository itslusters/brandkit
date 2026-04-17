'use client'
import type { ReactNode } from 'react'

interface Props {
  text: string
  children: ReactNode
  position?: 'top' | 'bottom'
}

// Pure CSS tooltip — zero JS overhead, just hover state.
export function Tooltip({ text, children, position = 'top' }: Props) {
  const posClass = position === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-2'

  return (
    <span className="relative group/tooltip inline-flex">
      {children}
      <span
        className={`absolute ${posClass} left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-200 whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 scale-95 group-hover/tooltip:scale-100 transition-all duration-150 pointer-events-none z-50`}
      >
        {text}
      </span>
    </span>
  )
}
