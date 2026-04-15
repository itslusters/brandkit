import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { NamingCard } from '@/components/brand/NamingCard'
import type { NamingCandidate } from '@/lib/types'

const candidate: NamingCandidate = {
  name: 'Nexio',
  rationale: '간결한 테크 스타트업 이름',
}

describe('NamingCard', () => {
  it('renders the candidate name', () => {
    render(<NamingCard candidate={candidate} selected={false} onSelect={vi.fn()} />)
    expect(screen.getByText('Nexio')).toBeInTheDocument()
  })

  it('renders the rationale', () => {
    render(<NamingCard candidate={candidate} selected={false} onSelect={vi.fn()} />)
    expect(screen.getByText('간결한 테크 스타트업 이름')).toBeInTheDocument()
  })

  it('calls onSelect with the name when clicked', async () => {
    const onSelect = vi.fn()
    render(<NamingCard candidate={candidate} selected={false} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith('Nexio')
  })

  it('shows a checkmark indicator when selected', () => {
    render(<NamingCard candidate={candidate} selected={true} onSelect={vi.fn()} />)
    expect(document.querySelector('.bg-white.rounded-full')).toBeInTheDocument()
  })

  it('does not show checkmark when not selected', () => {
    render(<NamingCard candidate={candidate} selected={false} onSelect={vi.fn()} />)
    expect(document.querySelector('.bg-white.rounded-full')).not.toBeInTheDocument()
  })
})
