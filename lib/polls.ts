import 'server-only'
import { Redis } from '@upstash/redis'
import { nanoid } from 'nanoid'

const redis = Redis.fromEnv()

export interface BrandPoll {
  id: string
  creatorId: string
  title: string
  optionA: { brandId: string; name: string; logoUrl: string }
  optionB: { brandId: string; name: string; logoUrl: string }
  votesA: number
  votesB: number
  createdAt: number
}

export async function createPoll(args: Omit<BrandPoll, 'id' | 'votesA' | 'votesB' | 'createdAt'>): Promise<BrandPoll> {
  const id = nanoid(10)
  const poll: BrandPoll = { id, ...args, votesA: 0, votesB: 0, createdAt: Date.now() }
  await redis.set(`poll:${id}`, poll)
  await redis.zadd('polls:all', { score: Date.now(), member: id })
  return poll
}

export async function getPoll(id: string): Promise<BrandPoll | null> {
  return redis.get<BrandPoll>(`poll:${id}`)
}

export async function vote(pollId: string, choice: 'A' | 'B', voterId: string): Promise<BrandPoll | null> {
  // Check if already voted
  const alreadyVoted = await redis.sismember(`poll:${pollId}:voters`, voterId)
  if (alreadyVoted) return getPoll(pollId)

  await redis.sadd(`poll:${pollId}:voters`, voterId)

  const key = `poll:${pollId}`
  const field = choice === 'A' ? 'votesA' : 'votesB'

  // Increment vote count
  const poll = await redis.get<BrandPoll>(key)
  if (!poll) return null
  const updated = { ...poll, [field]: (poll[field] ?? 0) + 1 }
  await redis.set(key, updated)
  return updated
}

export async function hasVoted(pollId: string, voterId: string): Promise<boolean> {
  return !!(await redis.sismember(`poll:${pollId}:voters`, voterId))
}
