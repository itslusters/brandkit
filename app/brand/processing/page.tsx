'use client'
import { useState, useEffect } from 'react'
import { StreamingDashboard } from '@/components/ui/StreamingDashboard'
import { INITIAL_STREAM_TASKS } from '@/lib/constants'
import type { StreamTask } from '@/lib/types'

// DEMO: cycles through task states with setTimeout
// Replace with real SSE/streaming in MVP-2
export default function ProcessingPage() {
  // TODO MVP-2: replace demo with real Claude streaming; read brandInput via getSession('brandInput')
  const [tasks, setTasks] = useState<StreamTask[]>(() =>
    INITIAL_STREAM_TASKS.map(t => ({ ...t }))
  )
  const [elapsed, setElapsed] = useState(0)
  const ESTIMATED = 12

  useEffect(() => {
    const tick = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(tick)
  }, [])

  // Demo: activate each task in sequence
  useEffect(() => {
    const t1 = setTimeout(() => setTasks(prev => activate(prev, 'industry', 'SaaS B2B — clean, minimal, trusted aesthetics')), 800)
    const t2 = setTimeout(() => setTasks(prev => done(prev, 'industry')), 3500)
    const t3 = setTimeout(() => setTasks(prev => activate(prev, 'naming', '')), 3600)
    const t4 = setTimeout(() => setTasks(prev => done(prev, 'naming', 'Nexio, Veltro, Clyra, Foundr, Arkos')), 7000)
    const t5 = setTimeout(() => setTasks(prev => activate(prev, 'brief', '')), 7100)
    const t6 = setTimeout(() => setTasks(prev => done(prev, 'brief', 'Geometric Minimal — charcoal + white + accent gold')), 11000)
    return () => [t1,t2,t3,t4,t5,t6].forEach(clearTimeout)
  }, [])

  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Building your brand</h1>
        <p className="text-zinc-500 text-sm mt-1">AI is analyzing your inputs.</p>
      </div>
      <StreamingDashboard
        tasks={tasks}
        estimatedSeconds={ESTIMATED}
        elapsedSeconds={elapsed}
      />
    </div>
  )
}

function activate(tasks: StreamTask[], id: string, content: string): StreamTask[] {
  return tasks.map(t => t.id === id ? { ...t, status: 'active', content } : t)
}

function done(tasks: StreamTask[], id: string, content?: string): StreamTask[] {
  return tasks.map(t =>
    t.id === id ? { ...t, status: 'done', content: content ?? t.content } : t
  )
}
