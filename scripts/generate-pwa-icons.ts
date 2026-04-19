/* Generates PWA / Apple touch icons into public/.
 * Source: public/atriium-symbol.svg composited over the dark brand canvas.
 * Run whenever the symbol mark changes:
 *   npx tsx scripts/generate-pwa-icons.ts
 */
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'public')
const BG = '#09090b' // matches manifest theme_color
const SYMBOL_PATH = path.join(process.cwd(), 'public', 'atriium-symbol.svg')

/**
 * Compose the symbol at ~62% of canvas width, centered, on the brand-dark
 * canvas. `safeAreaPadding` leaves extra headroom for platform masks that
 * crop to a rounded square / circle (Android adaptive, Samsung).
 */
async function write(name: string, size: number, safeAreaPadding = 0) {
  const rawSymbol = readFileSync(SYMBOL_PATH)
  const pad = Math.round(size * safeAreaPadding)
  const box = size - pad * 2
  const markSize = Math.round(box * 0.62)

  const mark = await sharp(rawSymbol).resize(markSize, markSize, { fit: 'contain' }).png().toBuffer()
  const canvas = await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  }).composite([{ input: mark, gravity: 'center' }]).png().toBuffer()

  await sharp(canvas).png().toFile(path.join(OUT, name))
  console.log(`✓ ${name} (${size}×${size})`)
}

async function main() {
  await Promise.all([
    write('icon-192.png', 192),
    write('icon-512.png', 512),
    // Maskable icons need ≥10% safe-area padding so platform masks don't clip.
    write('icon-maskable-512.png', 512, 0.14),
    write('apple-touch-icon.png', 180),
  ])
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
