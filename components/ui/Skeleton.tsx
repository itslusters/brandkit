'use client'

/**
 * Shared shimmer skeleton primitive. Uses the `skeleton-shimmer` keyframe
 * defined in globals.css so every placeholder in the app breathes at the
 * same rhythm instead of each page reinventing its own. Tone matches the
 * zinc card palette.
 *
 * Usage:
 *   <Skeleton className="h-6 w-32" />                       // text line
 *   <Skeleton rounded="xl" className="aspect-square w-full"/>// image tile
 *   <Skeleton rounded="full" className="w-10 h-10" />       // avatar
 */

interface Props {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  tone?: 'surface' | 'surface-strong'
}

const ROUNDED_MAP = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-3xl',
  full: 'rounded-full',
} as const

export function Skeleton({ className = '', rounded = 'md', tone = 'surface' }: Props) {
  const bg = tone === 'surface-strong' ? 'bg-zinc-800/50' : 'bg-zinc-900/60'
  return (
    <div
      aria-hidden="true"
      className={`${ROUNDED_MAP[rounded]} ${bg} skeleton-shimmer ${className}`}
    />
  )
}

/**
 * Composite placeholder matching a typical brand-library card: logo plate,
 * mockup strip, title + metadata. Used on /account/brands for initial load
 * and on any page that renders brand previews while fetching.
 */
export function BrandCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/30 overflow-hidden">
      <Skeleton tone="surface-strong" className="aspect-[4/3] w-full rounded-none" />
      <div className="flex border-t border-b border-zinc-800/70">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} tone="surface-strong" className="flex-1 aspect-square rounded-none" />
        ))}
      </div>
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}
