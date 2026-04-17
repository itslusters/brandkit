import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LogoTypeCard } from '@/components/brand/LogoTypeCard'

describe('LogoTypeCard', () => {
  it('renders the label', () => {
    render(
      <LogoTypeCard
        type="wordmark"
        label="Wordmark"
        description="텍스트만 사용"
        selected={false}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText('Wordmark')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(
      <LogoTypeCard
        type="wordmark"
        label="Wordmark"
        description="텍스트만 사용"
        selected={false}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByText('텍스트만 사용')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn()
    render(
      <LogoTypeCard
        type="wordmark"
        label="Wordmark"
        description="텍스트만 사용"
        selected={false}
        onSelect={onSelect}
      />
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('shows checkmark when selected', () => {
    render(
      <LogoTypeCard
        type="wordmark"
        label="Wordmark"
        description="텍스트만 사용"
        selected={true}
        onSelect={vi.fn()}
      />
    )
    // Checkmark appears when selected
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('does not show border-white when not selected', () => {
    const { container } = render(
      <LogoTypeCard
        type="wordmark"
        label="Wordmark"
        description="텍스트만 사용"
        selected={false}
        onSelect={vi.fn()}
      />
    )
    expect(container.querySelector('.border-white')).not.toBeInTheDocument()
  })
})
