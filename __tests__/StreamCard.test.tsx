import { render, screen } from '@testing-library/react'
import { StreamCard } from '@/components/ui/StreamCard'
import type { StreamTask } from '@/lib/types'

const base: StreamTask = { id: '1', label: 'Analyzing industry', status: 'pending', content: '' }

describe('StreamCard', () => {
  it('renders label', () => {
    render(<StreamCard task={base} index={0} />)
    expect(screen.getByText('Analyzing industry')).toBeInTheDocument()
  })

  it('shows spinner icon when active', () => {
    render(<StreamCard task={{ ...base, status: 'active' }} index={0} />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does NOT show spinner when pending', () => {
    render(<StreamCard task={base} index={0} />)
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
  })

  it('shows content text when done', () => {
    render(<StreamCard task={{ ...base, status: 'done', content: 'SaaS B2B archetype' }} index={0} />)
    expect(screen.getByText('SaaS B2B archetype')).toBeInTheDocument()
  })

  it('hides content text when pending', () => {
    render(<StreamCard task={{ ...base, content: 'hidden' }} index={0} />)
    expect(screen.queryByText('hidden')).not.toBeInTheDocument()
  })
})
