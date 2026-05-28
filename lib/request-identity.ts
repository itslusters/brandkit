import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { getIp } from './ratelimit'

const ANON_RE = /^[a-zA-Z0-9-]{1,64}$/

export interface RequestIdentity {
  userId: string | null
  rlKey: string
}

/**
 * Resolves the rate-limit key for a generation request. Priority:
 *   signed-in Clerk userId → validated x-anon-id header → caller IP.
 * Namespacing the key by source keeps an anon id from ever colliding with a
 * real userId in the shared Upstash key space.
 */
export async function resolveRequestIdentity(req: Request): Promise<RequestIdentity> {
  const { userId } = await auth()
  if (userId) return { userId, rlKey: userId }

  const anon = req.headers.get('x-anon-id')?.trim()
  if (anon && ANON_RE.test(anon)) return { userId: null, rlKey: `anon:${anon}` }

  return { userId: null, rlKey: `ip:${getIp(req)}` }
}
