import { getPublicBrand } from '@/lib/brands'
import { publicBrandLimiter, getIp } from '@/lib/ratelimit'

interface Params { params: { id: string } }

export async function GET(req: Request, { params }: Params) {
  const ip = getIp(req)
  const { success } = await publicBrandLimiter.limit(ip)
  if (!success) return Response.json({ error: 'rate_limit' }, { status: 429 })

  const brand = await getPublicBrand(params.id)
  if (!brand) return Response.json({ error: 'not_found' }, { status: 404 })
  return Response.json({ brand })
}
