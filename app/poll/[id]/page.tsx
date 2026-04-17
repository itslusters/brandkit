import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPoll } from '@/lib/polls'
import { PollView } from '@/components/poll/PollView'

interface Params { params: { id: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const poll = await getPoll(params.id)
  if (!poll) return { title: 'Poll not found' }
  return {
    title: `${poll.optionA.name} vs ${poll.optionB.name} — BrandKit Poll`,
    description: poll.title,
  }
}

export default async function PollPage({ params }: Params) {
  const poll = await getPoll(params.id)
  if (!poll) notFound()
  return <PollView initialPoll={poll} />
}
