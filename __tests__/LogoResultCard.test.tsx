import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LogoResultCard } from '@/components/brand/LogoResultCard'

describe('LogoResultCard', () => {
  it('renders skeleton state without image', () => {
    const { container } = render(
      <LogoResultCard state="skeleton" selected={false} onSelect={vi.fn()} />
    )
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('renders img element in result state', () => {
    render(
      <LogoResultCard
        state="result"
        dataUrl="data:image/png;base64,abc"
        selected={false}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('sets correct src on the image', () => {
    render(
      <LogoResultCard
        state="result"
        dataUrl="data:image/png;base64,abc"
        selected={false}
        onSelect={vi.fn()}
      />
    )
    expect(screen.getByRole('img')).toHaveAttribute('src', 'data:image/png;base64,abc')
  })

  it('calls onSelect when result card is clicked', async () => {
    const onSelect = vi.fn()
    render(
      <LogoResultCard
        state="result"
        dataUrl="data:image/png;base64,abc"
        selected={false}
        onSelect={onSelect}
      />
    )
    await userEvent.click(screen.getByRole('img'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('shows selection ring when selected in result state', () => {
    const { container } = render(
      <LogoResultCard
        state="result"
        dataUrl="data:image/png;base64,abc"
        selected={true}
        onSelect={vi.fn()}
      />
    )
    expect(container.querySelector('.border-white')).toBeInTheDocument()
  })

  it('does not show selection ring when not selected', () => {
    const { container } = render(
      <LogoResultCard
        state="result"
        dataUrl="data:image/png;base64,abc"
        selected={false}
        onSelect={vi.fn()}
      />
    )
    expect(container.querySelector('.border-white')).not.toBeInTheDocument()
  })
})
