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

// promptDirective is a typography/palette/composition HINT, not a complete
// brand framing. The previous "Editorial luxury brand — think Monocle, Kinfolk,
// Cereal" wording was strong enough to hijack the brief regardless of industry
// (e.g. a SaaS app picking Editorial got a magazine identity, ignoring tech
// signals entirely). We keep these directives narrowly scoped so the user's
// industry stays the dominant axis and the style pack only colors the surface.
export const STYLE_PACKS: StylePack[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Serif typography, muted palettes, magazine polish',
    tones: ['elegant', 'editorial', 'refined'],
    promptDirective: 'serif-forward, generous whitespace, muted palette (surface only).',
    accentColor: '#8B7355',
    fontHint: 'Aa',
  },
  {
    id: 'geometric',
    name: 'Geometric',
    description: 'Clean sans-serif, structured, mathematical',
    tones: ['modern', 'minimal', 'clean'],
    promptDirective: 'geometric sans-serif, grid-based, precise negative space, monochromatic (surface).',
    accentColor: '#3B82F6',
    fontHint: 'Ag',
  },
  {
    id: 'organic',
    name: 'Organic',
    description: 'Warm textures, earthy, handcrafted',
    tones: ['warm', 'organic', 'artisan'],
    promptDirective: 'humanist sans or warm serif, tactile, earth-tone palette (surface).',
    accentColor: '#92400E',
    fontHint: 'Ao',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Heavy type, high contrast, confident',
    tones: ['bold', 'confident', 'strong'],
    promptDirective: 'extra-heavy weight, high contrast (often B&W), maximum impact (surface).',
    accentColor: '#DC2626',
    fontHint: 'Ab',
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Monospace, dark mode, developer aesthetic',
    tones: ['tech', 'precise', 'modern'],
    promptDirective: 'monospace or technical sans-serif, systematic color tokens (surface).',
    accentColor: '#22C55E',
    fontHint: '01',
  },
]

export function getStylePack(id: string): StylePack | undefined {
  return STYLE_PACKS.find(p => p.id === id)
}
