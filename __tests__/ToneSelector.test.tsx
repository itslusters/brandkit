import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToneSelector } from '@/components/onboarding/ToneSelector'

describe('ToneSelector', () => {
  it('renders all tone keywords', () => {
    render(<ToneSelector selected={[]} onChange={() => {}} />)
    expect(screen.getByText('Bold')).toBeInTheDocument()
    expect(screen.getByText('Minimal')).toBeInTheDocument()
  })

  it('calls onChange with tone added when clicking unselected', async () => {
    const onChange = vi.fn()
    render(<ToneSelector selected={[]} onChange={onChange} />)
    await userEvent.click(screen.getByText('Bold'))
    expect(onChange).toHaveBeenCalledWith(['Bold'])
  })

  it('calls onChange with tone removed when clicking selected', async () => {
    const onChange = vi.fn()
    render(<ToneSelector selected={['Bold']} onChange={onChange} />)
    await userEvent.click(screen.getByText('Bold'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('does NOT call onChange when 3 already selected and clicking a new tone', async () => {
    const onChange = vi.fn()
    render(<ToneSelector selected={['Bold', 'Minimal', 'Playful']} onChange={onChange} />)
    await userEvent.click(screen.getByText('Premium'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows 3/3 count when 3 selected', () => {
    render(<ToneSelector selected={['Bold', 'Minimal', 'Playful']} onChange={() => {}} />)
    expect(screen.getByText('3/3 selected')).toBeInTheDocument()
  })
})
