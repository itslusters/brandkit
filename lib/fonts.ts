import 'server-only'
import { readFileSync } from 'fs'
import path from 'path'
import { getStylePack } from './style-packs'

export interface FontEntry {
  family: string
  file: string       // filename in /public/fonts/
  weight: number
  style: 'normal'
  category: 'sans' | 'serif' | 'display' | 'mono'
  tags: string[]     // matched against brand tones
}

// Curated catalog — each font hand-picked for brand design quality.
// Tags are matched against BrandInput.tones + customTone for scoring.
export const FONT_CATALOG: FontEntry[] = [
  // Modern sans — clean, tech, trustworthy
  { family: 'Inter', file: 'Inter-var.ttf', weight: 700, style: 'normal', category: 'sans', tags: ['modern', 'clean', 'tech', 'minimal', 'trusted', 'professional'] },
  { family: 'Space Grotesk', file: 'SpaceGrotesk-var.ttf', weight: 700, style: 'normal', category: 'sans', tags: ['bold', 'tech', 'confident', 'modern', 'geometric'] },
  { family: 'Manrope', file: 'Manrope-var.ttf', weight: 800, style: 'normal', category: 'sans', tags: ['friendly', 'approachable', 'warm', 'modern', 'rounded'] },

  // Editorial serif — elegant, luxurious, classic
  { family: 'Playfair Display', file: 'PlayfairDisplay-400.ttf', weight: 400, style: 'normal', category: 'serif', tags: ['elegant', 'editorial', 'luxurious', 'classic', 'fashion', 'premium'] },
  { family: 'Fraunces', file: 'Fraunces-var.ttf', weight: 700, style: 'normal', category: 'serif', tags: ['editorial', 'sophisticated', 'warm', 'artisan', 'organic'] },
  { family: 'DM Serif Display', file: 'DMSerifDisplay-400.ttf', weight: 400, style: 'normal', category: 'serif', tags: ['elegant', 'fashion', 'display', 'classic', 'refined'] },
  { family: 'Instrument Serif', file: 'InstrumentSerif-400.ttf', weight: 400, style: 'normal', category: 'serif', tags: ['minimal', 'editorial', 'refined', 'quiet', 'understated'] },

  // Display / heavy — impact, bold, expressive
  { family: 'Archivo Black', file: 'ArchivoBlack-900.ttf', weight: 900, style: 'normal', category: 'display', tags: ['bold', 'heavy', 'confident', 'impact', 'loud', 'strong'] },
  { family: 'Bricolage Grotesque', file: 'BricolageGrotesque-800.ttf', weight: 800, style: 'normal', category: 'display', tags: ['expressive', 'modern', 'playful', 'creative', 'bold'] },

  // Mono — tech, developer, precise
  { family: 'JetBrains Mono', file: 'JetBrainsMono-400.ttf', weight: 400, style: 'normal', category: 'mono', tags: ['tech', 'developer', 'precise', 'code', 'hacker', 'startup'] },
  { family: 'IBM Plex Mono', file: 'IBMPlexMono-400.ttf', weight: 400, style: 'normal', category: 'mono', tags: ['corporate', 'precise', 'tech', 'trusted', 'professional'] },
]

// Cache loaded font buffers in memory (Node process lifetime = Vercel warm instance)
const fontBufferCache = new Map<string, ArrayBuffer>()

export function loadFontBuffer(entry: FontEntry): ArrayBuffer {
  const cached = fontBufferCache.get(entry.file)
  if (cached) return cached
  const filePath = path.join(process.cwd(), 'public', 'fonts', entry.file)
  const buf = readFileSync(filePath)
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  fontBufferCache.set(entry.file, ab)
  return ab
}

// Score each font against the brand's tones and pick the top 3 from different categories.
// Ensures visual diversity: e.g., one sans + one serif + one display.
export function pickFontsForTones(tones: string[], customTone?: string, stylePack?: string): FontEntry[] {
  // Style pack tones get extra weight so the pack's aesthetic comes through
  const packTones = stylePack ? (getStylePack(stylePack)?.tones ?? []) : []
  const allTones = [...tones, ...packTones, ...(customTone?.toLowerCase().split(/[\s,]+/) ?? [])].map(t => t.toLowerCase())

  const scored = FONT_CATALOG.map(entry => {
    const score = entry.tags.reduce((sum, tag) => {
      // Exact match
      if (allTones.includes(tag)) return sum + 2
      // Partial match (e.g., "bold" in "bold" tone)
      if (allTones.some(t => t.includes(tag) || tag.includes(t))) return sum + 1
      return sum
    }, 0)
    return { entry, score }
  }).sort((a, b) => b.score - a.score)

  // Pick top scorer from each category, then fill remaining from overall top
  const picked: FontEntry[] = []
  const usedCategories = new Set<string>()

  for (const { entry } of scored) {
    if (picked.length >= 3) break
    if (!usedCategories.has(entry.category)) {
      picked.push(entry)
      usedCategories.add(entry.category)
    }
  }

  // If we couldn't fill 3 from different categories, fill from top scorers
  for (const { entry } of scored) {
    if (picked.length >= 3) break
    if (!picked.includes(entry)) picked.push(entry)
  }

  return picked
}
