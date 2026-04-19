import { auth } from '@clerk/nextjs/server'
import { getBrand, deleteBrand, renameBrand } from '@/lib/brands'

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

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  let body: { name?: string } = {}
  try { body = await req.json() } catch { /* empty body is ok */ }

  const next = typeof body.name === 'string' ? body.name.trim() : ''
  if (!next) return Response.json({ error: 'invalid_name', message: 'Name is required.' }, { status: 400 })
  if (next.length > 80) return Response.json({ error: 'invalid_name', message: 'Name is too long (max 80).' }, { status: 400 })

  const brand = await getBrand(userId, params.id)
  if (!brand) return Response.json({ error: 'not_found' }, { status: 404 })
  const updated = await renameBrand(userId, params.id, next)
  return Response.json({ brand: updated })
}
