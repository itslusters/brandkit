/**
 * Generates iOS / App Store assets from the Atriium logo SVG.
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
const SVG_PATH = path.join(process.cwd(), 'public', 'atriium.svg')

async function iconAt(size: number, name: string) {
  const svg = readFileSync(SVG_PATH)
  // Render the SVG at ~52% of canvas width, centered, over the dark BG.
  const logoSize = Math.round(size * 0.52)
  const logoHeight = Math.round(logoSize * (132 / 248)) // original SVG aspect 248×132
  const logo = await sharp(svg).resize(logoSize, logoHeight, { fit: 'contain' }).png().toBuffer()
  const canvas = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer()
  await sharp(canvas).png().toFile(path.join(OUT, name))
  console.log(`✓ ${name} (${size}×${size})`)
}

async function splashAt(width: number, height: number, name: string) {
  const svg = readFileSync(SVG_PATH)
  // Logo at ~30% of short dimension (prevents oversize on tall splashes).
  const short = Math.min(width, height)
  const logoWidth = Math.round(short * 0.34)
  const logoHeight = Math.round(logoWidth * (132 / 248))
  const logo = await sharp(svg).resize(logoWidth, logoHeight, { fit: 'contain' }).png().toBuffer()
  const canvas = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
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
