import { auth } from '@clerk/nextjs/server'
import { createPoll } from '@/lib/polls'
import { getBrand } from '@/lib/brands'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { title, brandIdA, brandIdB } = await req.json() as { title: string; brandIdA: string; brandIdB: string }

  const [brandA, brandB] = await Promise.all([
    getBrand(userId, brandIdA),
    getBrand(userId, brandIdB),
  ])

  if (!brandA || !brandB) return Response.json({ error: 'brand_not_found' }, { status: 404 })

  const poll = await createPoll({
    creatorId: userId,
    title: title || `${brandA.name} vs ${brandB.name}`,
    optionA: { brandId: brandA.id, name: brandA.name, logoUrl: brandA.selectedLogoUrl },
    optionB: { brandId: brandB.id, name: brandB.name, logoUrl: brandB.selectedLogoUrl },
  })

  return Response.json({ poll })
}
