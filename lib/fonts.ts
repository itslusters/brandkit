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
//
// Satori v0.26 has parsing issues with some variable fonts and certain
// TTF builds (fails with "Cannot read properties of undefined reading '256'"
// on malformed/unsupported cmap subtables). Excluded files as of 2026-04-18:
//   Inter-var.ttf, SpaceGrotesk-var.ttf, Manrope-var.ttf, Fraunces-var.ttf,
//   BricolageGrotesque-800.ttf
// When static replacements become available (e.g., Inter-Bold.ttf), they can
// be re-added. Variable fonts must be converted to static instances first.
export const FONT_CATALOG: FontEntry[] = [
  // Editorial serif — elegant, luxurious, classic
  { family: 'Playfair Display', file: 'PlayfairDisplay-400.ttf', weight: 400, style: 'normal', category: 'serif', tags: ['elegant', 'editorial', 'luxurious', 'classic', 'fashion', 'premium'] },
  { family: 'DM Serif Display', file: 'DMSerifDisplay-400.ttf', weight: 400, style: 'normal', category: 'serif', tags: ['elegant', 'fashion', 'display', 'classic', 'refined', 'modern'] },
  { family: 'Instrument Serif', file: 'InstrumentSerif-400.ttf', weight: 400, style: 'normal', category: 'serif', tags: ['minimal', 'editorial', 'refined', 'quiet', 'understated', 'clean'] },

  // Display / heavy — impact, bold, expressive
  { family: 'Archivo Black', file: 'ArchivoBlack-900.ttf', weight: 900, style: 'normal', category: 'display', tags: ['bold', 'heavy', 'confident', 'impact', 'loud', 'strong', 'modern', 'tech'] },

  // Mono — tech, developer, precise
  { family: 'JetBrains Mono', file: 'JetBrainsMono-400.ttf', weight: 400, style: 'normal', category: 'mono', tags: ['tech', 'developer', 'precise', 'code', 'hacker', 'startup', 'minimal'] },
  { family: 'IBM Plex Mono', file: 'IBMPlexMono-400.ttf', weight: 400, style: 'normal', category: 'mono', tags: ['corporate', 'precise', 'tech', 'trusted', 'professional', 'clean'] },
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
