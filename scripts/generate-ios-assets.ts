/**
 * Generates iOS / App Store assets from the Atriium brand files.
 *
 * Sources:
 *   public/atriium-symbol.svg    — square symbol mark, used for app icons
 *   public/atriium-wordmark.svg  — horizontal wordmark, used for splashes
 *
 * Outputs (under public/ios/):
 *   app-icon-1024.png          — App Store listing icon (required)
 *   app-icon-180.png           — iPhone @3x
 *   app-icon-120.png           — iPhone @2x
 *   splash-2732x2732.png       — universal splash (Capacitor convention)
 *   splash-1242x2688.png       — iPhone 6.5" portrait
 *   splash-1125x2436.png       — iPhone 5.8" portrait
 *
 * Run: npx tsx scripts/generate-ios-assets.ts
 */
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.join(process.cwd(), 'public', 'ios')
const BG = '#09090b' // matches manifest theme_color
const SYMBOL_PATH = path.join(process.cwd(), 'public', 'atriium-symbol.svg')
const WORDMARK_PATH = path.join(process.cwd(), 'public', 'atriium-wordmark.svg')

// Wordmark viewBox is 902x143 — cached here so splash calculations keep
// the original aspect ratio without re-parsing the SVG each call.
const WORDMARK_ASPECT = 902 / 143

async function iconAt(size: number, name: string) {
  const svg = readFileSync(SYMBOL_PATH)
  // Square symbol looks right at ~62% of canvas width, centered.
  const markSize = Math.round(size * 0.62)
  const mark = await sharp(svg).resize(markSize, markSize, { fit: 'contain' }).png().toBuffer()
  const canvas = await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer()
  await sharp(canvas).png().toFile(path.join(OUT, name))
  console.log(`✓ ${name} (${size}×${size})`)
}

async function splashAt(width: number, height: number, name: string) {
  const svg = readFileSync(WORDMARK_PATH)
  // Wordmark at ~40% of short dimension, maintain aspect ratio.
  const short = Math.min(width, height)
  const wordmarkWidth = Math.round(short * 0.4)
  const wordmarkHeight = Math.round(wordmarkWidth / WORDMARK_ASPECT)
  const wordmark = await sharp(svg).resize(wordmarkWidth, wordmarkHeight, { fit: 'contain' }).png().toBuffer()
  const canvas = await sharp({
    create: { width, height, channels: 4, background: BG },
  })
    .composite([{ input: wordmark, gravity: 'center' }])
    .png()
    .toBuffer()
  await sharp(canvas).png().toFile(path.join(OUT, name))
  console.log(`✓ ${name} (${width}×${height})`)
}

async function main() {
  await mkdir(OUT, { recursive: true })
  await Promise.all([
    iconAt(1024, 'app-icon-1024.png'),
    iconAt(180, 'app-icon-180.png'),
    iconAt(120, 'app-icon-120.png'),
    splashAt(2732, 2732, 'splash-2732x2732.png'),
    splashAt(1242, 2688, 'splash-1242x2688.png'),
    splashAt(1125, 2436, 'splash-1125x2436.png'),
  ])
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
