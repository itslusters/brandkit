import { auth } from '@clerk/nextjs/server'
import { listBrands } from '@/lib/brands'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })
  const brands = await listBrands(userId)
  return Response.json({ brands })
}
