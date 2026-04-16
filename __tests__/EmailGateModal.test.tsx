import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { EmailGateModal } from '@/components/brand/EmailGateModal'

describe('EmailGateModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <EmailGateModal open={false} onSubmit={vi.fn()} onClose={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows email input when open', () => {
    render(<EmailGateModal open={true} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('rejects invalid email client-side', async () => {
    const onSubmit = vi.fn()
    render(<EmailGateModal open={true} onSubmit={onSubmit} onClose={vi.fn()} />)
    await userEvent.type(screen.getByRole('textbox'), 'notanemail')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/valid email/i)).toBeInTheDocument()
  })

  it('calls onSubmit with trimmed lowercase email', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<EmailGateModal open={true} onSubmit={onSubmit} onClose={vi.fn()} />)
    await userEvent.type(screen.getByRole('textbox'), '  USER@Test.com  ')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('user@test.com'))
  })

  it('shows friendly message on 429 error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('daily_limit'))
    render(<EmailGateModal open={true} onSubmit={onSubmit} onClose={vi.fn()} />)
    await userEvent.type(screen.getByRole('textbox'), 'a@b.co')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => {
      expect(screen.getByText(/try again tomorrow/i)).toBeInTheDocument()
    })
  })
})
