import { Skeleton } from '@/components/ui/Skeleton'

export default function PricingLoading() {
  return (
    <div className="pt-4 pb-12">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="mb-6 rounded-xl p-4 flex gap-3 bg-zinc-900/30 border border-zinc-800/70">
        <Skeleton rounded="md" className="w-6 h-6 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>

      <div className="mb-3 h-3 w-32">
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-800/70 bg-zinc-900/30 p-6 space-y-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-28" />
            <div className="space-y-2 pt-2">
              {[0, 1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
            <Skeleton rounded="full" className="h-10 w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
