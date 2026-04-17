import { render, screen } from '@testing-library/react'
import { StyleBriefDisplay } from '@/components/brand/StyleBriefDisplay'
import type { StyleBrief } from '@/lib/types'

const brief: StyleBrief = {
  recommendedStyle: 'Geometric Minimal',
  colorPalette: ['#18181b', '#ffffff', '#f59e0b'],
  typography: ['Inter — primary', 'Playfair Display — accent'],
  avoidList: ['그라디언트 남용', '네온 컬러', '둥근 캐릭터 일러스트'],
  moodImages: ['minimal-tech-1', 'minimal-tech-2', 'minimal-tech-3'],
  recommendedMockups: ['business-card', 'app-icon', 'social-post'],
}

describe('StyleBriefDisplay', () => {
  it('renders recommended style text', () => {
    render(<StyleBriefDisplay brief={brief} />)
    expect(screen.getByText('Geometric Minimal')).toBeInTheDocument()
  })

  it('renders all 3 hex color values as text', () => {
    render(<StyleBriefDisplay brief={brief} />)
    expect(screen.getByText('#18181b')).toBeInTheDocument()
    expect(screen.getByText('#ffffff')).toBeInTheDocument()
    expect(screen.getByText('#f59e0b')).toBeInTheDocument()
  })

  it('renders both typography entries', () => {
    render(<StyleBriefDisplay brief={brief} />)
    expect(screen.getByText('Inter — primary')).toBeInTheDocument()
    expect(screen.getByText('Playfair Display — accent')).toBeInTheDocument()
  })

  // Avoid section removed from UI (moved to PDF guide only)

  it('renders 3 mood images', () => {
    render(<StyleBriefDisplay brief={brief} />)
    expect(document.querySelectorAll('img')).toHaveLength(3)
  })

  it('mood image src includes correct id', () => {
    render(<StyleBriefDisplay brief={brief} />)
    const imgs = document.querySelectorAll('img') as NodeListOf<HTMLImageElement>
    expect(imgs[0].getAttribute('src')).toContain('minimal-tech-1')
  })
})
