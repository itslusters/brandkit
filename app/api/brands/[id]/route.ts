import { auth } from '@clerk/nextjs/server'
import { getBrand, deleteBrand } from '@/lib/brands'

interface Params {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const brand = await getBrand(userId, params.id)
  if (!brand) return Response.json({ error: 'not_found' }, { status: 404 })
  return Response.json({ brand })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const brand = await getBrand(userId, params.id)
  if (!brand) return Response.json({ error: 'not_found' }, { status: 404 })
  await deleteBrand(userId, params.id)
  return Response.json({ ok: true })
}
