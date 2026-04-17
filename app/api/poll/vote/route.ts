import { vote } from '@/lib/polls'
import { getIp } from '@/lib/ratelimit'

export async function POST(req: Request) {
  const { pollId, choice } = await req.json() as { pollId: string; choice: 'A' | 'B' }
  if (!pollId || !['A', 'B'].includes(choice)) {
    return Response.json({ error: 'invalid' }, { status: 400 })
  }

  // Use IP as voter ID for anonymous voting (no auth required to vote)
  const voterId = getIp(req)
  const poll = await vote(pollId, choice, voterId)
  if (!poll) return Response.json({ error: 'not_found' }, { status: 404 })

  return Response.json({ poll })
}
