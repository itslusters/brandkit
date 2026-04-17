// One-time: fetch curated Google Fonts TTFs into /public/fonts/ for satori rendering.
// Usage: npx tsx scripts/download-fonts.ts
// Commits font binaries to the repo — tiny (~2MB total) but gives us zero-latency, zero-flake rendering.

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

interface FontFile {
  family: string
  weight: number
  url: string
  filename: string
}

// Sources pull from the google/fonts GitHub mirror (SIL OFL / Apache licensed).
const FONTS: FontFile[] = [
  // Modern sans
  { family: 'Inter', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-Regular.ttf', filename: 'Inter-400.ttf' },
  { family: 'Inter', weight: 700, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-Bold.ttf', filename: 'Inter-700.ttf' },
  { family: 'Space Grotesk', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/static/SpaceGrotesk-Regular.ttf', filename: 'SpaceGrotesk-400.ttf' },
  { family: 'Space Grotesk', weight: 700, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/static/SpaceGrotesk-Bold.ttf', filename: 'SpaceGrotesk-700.ttf' },
  { family: 'Manrope', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/static/Manrope-Regular.ttf', filename: 'Manrope-400.ttf' },
  { family: 'Manrope', weight: 800, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/static/Manrope-ExtraBold.ttf', filename: 'Manrope-800.ttf' },

  // Editorial serif
  { family: 'Playfair Display', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf', filename: 'PlayfairDisplay-400.ttf' },
  { family: 'Fraunces', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Csoft%2Cwght%5D.ttf', filename: 'Fraunces-400.ttf' },
  { family: 'DM Serif Display', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmserifdisplay/DMSerifDisplay-Regular.ttf', filename: 'DMSerifDisplay-400.ttf' },
  { family: 'Instrument Serif', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/InstrumentSerif-Regular.ttf', filename: 'InstrumentSerif-400.ttf' },

  // Display / heavy
  { family: 'Archivo Black', weight: 900, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/archivoblack/ArchivoBlack-Regular.ttf', filename: 'ArchivoBlack-900.ttf' },
  { family: 'Bricolage Grotesque', weight: 800, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/bricolagegrotesque/BricolageGrotesque%5Bopsz%2Cwdth%2Cwght%5D.ttf', filename: 'BricolageGrotesque-800.ttf' },

  // Mono
  { family: 'JetBrains Mono', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf', filename: 'JetBrainsMono-400.ttf' },
  { family: 'IBM Plex Mono', weight: 400, url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/IBMPlexMono-Regular.ttf', filename: 'IBMPlexMono-400.ttf' },
]

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'fonts')
  await mkdir(outDir, { recursive: true })

  for (const font of FONTS) {
    console.log(`Fetching ${font.filename}...`)
    const res = await fetch(font.url)
    if (!res.ok) {
      console.error(`  FAIL ${res.status}: ${font.url}`)
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const out = path.join(outDir, font.filename)
    await writeFile(out, buf)
    console.log(`  → ${out} (${(buf.length / 1024).toFixed(0)}KB)`)
  }
  console.log('Done.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
