/* Generates PWA / Apple touch icons into public/.
 * Run once (or whenever the brand mark changes):
 *   npx tsx scripts/generate-pwa-icons.ts
 */
import sharp from 'sharp'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'public')
const BG = '#09090b' // matches manifest theme_color
const FG = '#fafafa'
const ACCENT = '#f59e0b'

// Maskable icons need ≥10% safe-area padding so platform masks don't clip the mark.
function markSvg(size: number, safeAreaPadding = 0): string {
  const pad = Math.round(size * safeAreaPadding)
  const box = size - pad * 2
  const fontSize = Math.round(box * 0.72)
  const cy = pad + Math.round(box * 0.72)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${BG}"/>
    <circle cx="${size - pad - Math.round(box * 0.18)}" cy="${pad + Math.round(box * 0.18)}" r="${Math.round(box * 0.06)}" fill="${ACCENT}"/>
    <text x="50%" y="${cy}" text-anchor="middle" font-family="Inter, system-ui, -apple-system, sans-serif" font-weight="900" font-size="${fontSize}" fill="${FG}" letter-spacing="-0.06em">K</text>
  </svg>`
}

async function write(name: string, size: number, safeArea = 0) {
  const svg = Buffer.from(markSvg(size, safeArea))
  const out = path.join(OUT, name)
  await sharp(svg).png().toFile(out)
  console.log(`✓ ${name} (${size}×${size})`)
}

async function main() {
  await Promise.all([
    write('icon-192.png', 192),
    write('icon-512.png', 512),
    write('icon-maskable-512.png', 512, 0.12),
    write('apple-touch-icon.png', 180),
  ])
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
