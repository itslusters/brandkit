import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { WaitlistModal } from '@/components/WaitlistModal'

describe('WaitlistModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <WaitlistModal open={false} plan="essentials" prefilledEmail="" onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows the plan in the title', () => {
    render(<WaitlistModal open={true} plan="pro" prefilledEmail="" onClose={vi.fn()} />)
    expect(screen.getByText(/pro waitlist/i)).toBeInTheDocument()
  })

  it('prefills email when provided and disables the input', () => {
    render(<WaitlistModal open={true} plan="essentials" prefilledEmail="user@x.com" onClose={vi.fn()} />)
    const input = screen.getByRole('textbox', { name: /email/i }) as HTMLInputElement
    expect(input.value).toBe('user@x.com')
    expect(input.disabled).toBe(true)
  })

  it('rejects invalid email when not prefilled', async () => {
    render(<WaitlistModal open={true} plan="essentials" prefilledEmail="" onClose={vi.fn()} />)
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'notvalid')
    await userEvent.click(screen.getByRole('button', { name: /join/i }))
    expect(screen.getByText(/valid email/i)).toBeInTheDocument()
  })

  it('shows success state after successful submit', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }) as any
    render(<WaitlistModal open={true} plan="essentials" prefilledEmail="a@b.co" onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /join/i }))
    await waitFor(() => expect(screen.getByText(/you're on the list/i)).toBeInTheDocument())
  })

  it('shows error state on 429', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({ error: 'rate_limit' }) }) as any
    render(<WaitlistModal open={true} plan="essentials" prefilledEmail="a@b.co" onClose={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /join/i }))
    await waitFor(() => expect(screen.getByText(/too many/i)).toBeInTheDocument())
  })
})
