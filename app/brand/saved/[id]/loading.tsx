import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Perceived-performance skeleton matching the BrandArtifact layout. Shown
 * during server render while /brand/saved/[id] fetches the brand record.
 */
export default function SavedBrandLoading() {
  return (
    <div className="pt-2 pb-16">
      {/* Masthead: eyebrow + brand name + summary */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-14 md:h-20 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Logo hero */}
      <Skeleton className="aspect-[3/2] w-full mb-4" rounded="2xl" tone="surface-strong" />

      {/* Palette band */}
      <Skeleton className="h-20 md:h-24 w-full mb-10" rounded="xl" />

      {/* Typography + Avoid two-column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-16 w-full" rounded="lg" />
          <Skeleton className="h-16 w-full" rounded="lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-7 w-20" rounded="full" />
            ))}
          </div>
        </div>
      </div>

      {/* Mockup grid */}
      <div className="mb-12 space-y-3">
        <Skeleton className="h-3 w-20" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-square w-full" rounded="xl" tone="surface-strong" />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Skeleton className="h-14 w-full" rounded="xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12" rounded="full" />
          <Skeleton className="h-12" rounded="full" />
        </div>
      </div>
    </div>
  )
}
