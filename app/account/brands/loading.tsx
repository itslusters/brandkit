import { Skeleton, BrandCardSkeleton } from '@/components/ui/Skeleton'

export default function LibraryLoading() {
  return (
    <div className="pt-4 pb-12">
      {/* Masthead placeholder matching the real header layout */}
      <div className="mb-8 flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28" rounded="md" />
      </div>

      {/* Toolbar placeholder */}
      <div className="flex gap-2 mb-5">
        <Skeleton className="flex-1 h-9" rounded="md" />
        <Skeleton className="h-9 w-32" rounded="md" />
      </div>

      {/* Grid of brand cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <BrandCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
