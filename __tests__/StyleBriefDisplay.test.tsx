import { render, screen } from '@testing-library/react'
import { StyleBriefDisplay } from '@/components/brand/StyleBriefDisplay'
import type { StyleBrief } from '@/lib/types'

const brief: StyleBrief = {
  recommendedStyle: 'Geometric Minimal',
  colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
  typography: ['Inter — primary', 'Playfair Display — accent'],
  avoidList: ['그라디언트 남용', '네온 컬러', '둥근 캐릭터 일러스트'],
  recommendedMockups: ['business-card', 'app-icon', 'social-post'],
}

describe('StyleBriefDisplay', () => {
  it('renders recommended style text', () => {
    render(<StyleBriefDisplay brief={brief} />)
    expect(screen.getByText('Geometric Minimal')).toBeInTheDocument()
  })

  it('renders all 3 hex color values as text', () => {
    render(<StyleBriefDisplay brief={brief} />)
    // Swatches display hex values uppercased for readability.
    expect(screen.getByText('#18181B')).toBeInTheDocument()
    expect(screen.getByText('#FFFFFF')).toBeInTheDocument()
    expect(screen.getByText('#F59E0B')).toBeInTheDocument()
  })

  it('renders both typography entries', () => {
    render(<StyleBriefDisplay brief={brief} />)
    expect(screen.getByText('Inter — primary')).toBeInTheDocument()
    expect(screen.getByText('Playfair Display — accent')).toBeInTheDocument()
  })

  // Avoid section removed from UI (moved to PDF guide only)
  // Mood image strip removed from UI entirely
})
