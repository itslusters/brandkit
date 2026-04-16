import { auth } from '@clerk/nextjs/server'
import { setPublicBrand } from '@/lib/brands'

interface Params { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json() as { public?: boolean }
  const isPublic = body.public === true
  const updated = await setPublicBrand(userId, params.id, isPublic)
  if (!updated) return Response.json({ error: 'not_found' }, { status: 404 })
  return Response.json({ brand: updated })
}
