// Run once to generate /public/landing/*.png — Bayer-dithered 1-bit illustrations.
// Usage: GEMINI_API_KEY=<key> npx tsx scripts/generate-landing-illustrations.ts
// Pipeline: Imagen 4 → grayscale → Bayer 8×8 dither → 1-bit PNG.

import { GoogleGenAI } from '@google/genai'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

interface Item {
  id: string
  prompt: string
  aspect: '1:1' | '16:9'
}

const ITEMS: Item[] = [
  {
    id: 'hero',
    aspect: '16:9',
    prompt:
      'Cinematic black and white photograph, dramatic high contrast, monochrome. A lone designer at a wooden desk, looking up at a swirling cosmos of floating brand symbols — logos, color swatches, geometric forms — descending like meteors from a starry night sky. Atmospheric, ethereal, classic Macintosh aesthetic. Strong rim lighting from above. No text.',
  },
  {
    id: 'step-input',
    aspect: '1:1',
    prompt:
      'Cinematic black and white photograph, dramatic high contrast, monochrome. A close-up macro shot of an old typewriter or vintage form being filled out by hand, dramatic side light, papers scattered. Symbolic of telling a brand story. Atmospheric texture. No text.',
  },
  {
    id: 'step-generate',
    aspect: '1:1',
    prompt:
      'Cinematic black and white photograph, dramatic high contrast, monochrome. An explosion of geometric shapes — circles, triangles, type letters, swatches — bursting outward from a central point against a pitch-black void. Sense of creative birth. Sharp edges, strong contrast. No text.',
  },
  {
    id: 'step-download',
    aspect: '1:1',
    prompt:
      'Cinematic black and white photograph, dramatic high contrast, monochrome. A neat stack of physical design assets on a dark surface — printed business cards, a folded brochure, a USB drive, a sealed envelope — lit dramatically from one side. Studio still life. No text.',
  },
]

// Standard Bayer 8×8 ordered dither matrix
const BAYER_8x8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]

async function bayerDither(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Single channel after grayscale
  const channels = info.channels
  const out = Buffer.from(data)

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * channels
      const threshold = ((BAYER_8x8[y % 8][x % 8] + 0.5) / 64) * 255
      const value = out[i] > threshold ? 255 : 0
      out[i] = value
      // copy to other channels if multi-channel (shouldn't happen after grayscale, but safe)
      for (let c = 1; c < channels; c++) out[i + c] = value
    }
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels },
  })
    .png({ palette: true, compressionLevel: 9 })
    .toBuffer()
}

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'landing')
  await mkdir(outDir, { recursive: true })

  for (const item of ITEMS) {
    console.log(`Generating ${item.id} (${item.aspect})...`)
    const res = await genai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: item.prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: item.aspect },
    })
    const b64 = res.generatedImages?.[0]?.image?.imageBytes
    if (!b64) {
      console.error(`  FAIL: ${item.id} returned no image`)
      continue
    }
    const sourceBuffer = Buffer.from(b64, 'base64')
    console.log(`  Imagen returned ${(sourceBuffer.length / 1024).toFixed(0)}KB`)

    const dithered = await bayerDither(sourceBuffer)
    const outPath = path.join(outDir, `${item.id}.png`)
    await writeFile(outPath, dithered)
    console.log(`  → ${outPath} (${(dithered.length / 1024).toFixed(0)}KB)`)
  }
  console.log('Done. Commit /public/landing/ to ship.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
