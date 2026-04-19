import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Matches the BrandArtifact layout rendered by the public share page so
 * inbound social traffic lands on something structured instead of a
 * blank screen while Redis lookup finishes.
 */
export default function SharedBrandLoading() {
  return (
    <div className="pt-2 pb-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 md:h-20 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton rounded="full" className="h-8 w-32 shrink-0" />
      </div>

      <Skeleton className="aspect-[3/2] w-full mb-4" rounded="2xl" tone="surface-strong" />
      <Skeleton className="h-20 md:h-24 w-full mb-10" rounded="xl" />

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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="aspect-square w-full" rounded="xl" tone="surface-strong" />
        ))}
      </div>

      <Skeleton className="h-52 w-full" rounded="2xl" />
    </div>
  )
}
