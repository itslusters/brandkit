// Pre-made aesthetic directions — selecting one auto-fills tones + injects
// a hidden prompt modifier into both Claude brief and Imagen/satori rendering.
// Think of these as "Krea modes" — one click → coherent output.

export interface StylePack {
  id: string
  name: string
  description: string
  tones: [string, string, string]  // auto-fill ToneSelector
  promptDirective: string          // injected into Claude + Imagen prompts
  accentColor: string              // for card preview bg
  fontHint: string                 // displayed as sample text
}

export const STYLE_PACKS: StylePack[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Serif typography, muted palettes, magazine polish',
    tones: ['elegant', 'editorial', 'refined'],
    promptDirective: 'Editorial luxury brand — think Monocle, Kinfolk, Cereal. Restrained serif-forward, muted earth tones, generous whitespace, high-end print feel.',
    accentColor: '#8B7355',
    fontHint: 'Aa',
  },
  {
    id: 'geometric',
    name: 'Geometric',
    description: 'Clean sans-serif, structured, mathematical',
    tones: ['modern', 'minimal', 'clean'],
    promptDirective: 'Geometric minimal — think Apple, Linear, Vercel. Swiss-influenced, monochromatic, grid-based, sans-serif, precise negative space.',
    accentColor: '#3B82F6',
    fontHint: 'Ag',
  },
  {
    id: 'organic',
    name: 'Organic',
    description: 'Warm textures, earthy, handcrafted',
    tones: ['warm', 'organic', 'artisan'],
    promptDirective: 'Organic artisan — think Aesop, local bakery, ceramics studio. Warm earth tones, tactile textures, serif or humanist sans, natural materials.',
    accentColor: '#92400E',
    fontHint: 'Ao',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Heavy type, high contrast, confident',
    tones: ['bold', 'confident', 'strong'],
    promptDirective: 'Bold statement — think Nike, Supreme, Off-White. Extra-heavy weight, high contrast B&W, minimal palette, maximum impact, brutalist edge.',
    accentColor: '#DC2626',
    fontHint: 'Ab',
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Monospace, dark mode, developer aesthetic',
    tones: ['tech', 'precise', 'modern'],
    promptDirective: 'Tech/developer — think GitHub, Stripe, Raycast. Monospace accents, dark UI-native, systematic color tokens, engineering precision.',
    accentColor: '#22C55E',
    fontHint: '01',
  },
]

export function getStylePack(id: string): StylePack | undefined {
  return STYLE_PACKS.find(p => p.id === id)
}
