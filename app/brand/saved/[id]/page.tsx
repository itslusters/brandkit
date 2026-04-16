import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getBrand } from '@/lib/brands'
import { SavedBrandView } from '@/components/brand/SavedBrandView'

interface Params {
  params: { id: string }
}

export default async function SavedBrandPage({ params }: Params) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const brand = await getBrand(userId, params.id)
  if (!brand) notFound()
  return <SavedBrandView brand={brand} />
}
