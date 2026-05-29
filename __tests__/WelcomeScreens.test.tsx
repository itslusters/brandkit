// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WelcomeScreens } from '@/components/welcome/WelcomeScreens'

describe('WelcomeScreens', () => {
  it('renders the first screen headline immediately (no async)', () => {
    render(<WelcomeScreens />)
    expect(screen.getByText(/become a brand/i)).toBeInTheDocument()
  })

  it('has a Skip link to onboarding', () => {
    render(<WelcomeScreens />)
    expect(screen.getByRole('link', { name: /skip/i })).toHaveAttribute('href', '/brand/new')
  })

  it('links to the examples feed', () => {
    render(<WelcomeScreens />)
    expect(screen.getByRole('link', { name: /examples/i })).toHaveAttribute('href', '/explore')
  })
})
