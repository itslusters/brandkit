import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { listBrands, FREE_TIER_BRAND_LIMIT } from '@/lib/brands'
import { getUserTier } from '@/lib/tier'
import { BrandsList } from '@/components/brand/BrandsList'

export default async function BrandsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [brands, tier] = await Promise.all([
    listBrands(userId),
    getUserTier(),
  ])

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your brands</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {brands.length === 0
              ? 'Brands you create are saved here automatically.'
              : tier === 'free'
                ? `${brands.length} of ${FREE_TIER_BRAND_LIMIT} on the Free plan.`
                : `${brands.length} saved.`}
          </p>
        </div>
        <a
          href="/brand/new"
          className="text-sm bg-white text-zinc-950 px-4 py-2 rounded-md font-medium hover:bg-zinc-200 transition-colors shrink-0"
        >
          + New brand
        </a>
      </div>

      <BrandsList initialBrands={brands} />
    </div>
  )
}
