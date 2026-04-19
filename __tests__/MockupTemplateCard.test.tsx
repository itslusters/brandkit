import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MockupTemplateCard } from '@/components/brand/MockupTemplateCard'
import type { MockupTemplate } from '@/lib/types'

const template: MockupTemplate = {
  id: 'business-card',
  name: 'Business Card',
  category: 'print',
  image: '/mockups/business-card.png',
  logoZone: { x: 0, y: 0, width: 100, height: 100 },
  aspectRatio: '4:3',
}

describe('MockupTemplateCard', () => {
  it('renders name and category', () => {
    render(<MockupTemplateCard template={template} selected={false} recommended={false} onToggle={vi.fn()} />)
    expect(screen.getByText('Business Card')).toBeInTheDocument()
    expect(screen.getByText(/print/i)).toBeInTheDocument()
  })

  it('shows Recommended badge when recommended', () => {
    render(<MockupTemplateCard template={template} selected={false} recommended={true} onToggle={vi.fn()} />)
    expect(screen.getByText(/recommended/i)).toBeInTheDocument()
  })

  it('does not show Recommended badge when not recommended', () => {
    render(<MockupTemplateCard template={template} selected={false} recommended={false} onToggle={vi.fn()} />)
    expect(screen.queryByText(/recommended/i)).not.toBeInTheDocument()
  })

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn()
    render(<MockupTemplateCard template={template} selected={false} recommended={false} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('shows check indicator when selected', () => {
    render(
      <MockupTemplateCard template={template} selected={true} recommended={false} onToggle={vi.fn()} />
    )
    // Card signals selection via aria-pressed on the root button.
    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument()
  })
})
