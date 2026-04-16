import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { PricingCard } from '@/components/PricingCard'

describe('PricingCard', () => {
  it('renders name + price + features', () => {
    render(
      <PricingCard
        name="Essentials"
        price="$29"
        priceSuffix="one-time"
        features={['Vector SVG', 'PDF guide']}
        ctaLabel="Join waitlist"
        onCtaClick={vi.fn()}
        highlighted={false}
      />
    )
    expect(screen.getByText('Essentials')).toBeInTheDocument()
    expect(screen.getByText('$29')).toBeInTheDocument()
    expect(screen.getByText('Vector SVG')).toBeInTheDocument()
    expect(screen.getByText('PDF guide')).toBeInTheDocument()
  })

  it('calls onCtaClick when button clicked', async () => {
    const onCtaClick = vi.fn()
    render(
      <PricingCard name="Free" price="$0" priceSuffix="" features={[]} ctaLabel="Get started" onCtaClick={onCtaClick} highlighted={false} />
    )
    await userEvent.click(screen.getByRole('button', { name: /get started/i }))
    expect(onCtaClick).toHaveBeenCalledOnce()
  })
})
