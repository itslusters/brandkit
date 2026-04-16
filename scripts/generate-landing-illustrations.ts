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

// Style is consistent across all four — only the framing/composition changes.
// Goal: atmospheric mood like the reference (lone figure, vast space, single
// dramatic light), NOT literal explanations of each step.
const STYLE =
  'Cinematic black and white photograph, dramatic high contrast, monochrome, atmospheric and ethereal mood. Single dramatic directional light. Empty negative space. Grainy film stock feel. No text, no logos, no UI.'

const ITEMS: Item[] = [
  {
    id: 'hero',
    aspect: '16:9',
    prompt: `${STYLE} A lone silhouetted figure standing on a vast empty plane, looking up at a sky filled with drifting cosmic dust and far-off light streaks. Wide cinematic frame, vast scale, sense of possibility and beginning.`,
  },
  {
    id: 'step-input',
    aspect: '1:1',
    prompt: `${STYLE} A lone silhouetted figure at the edge of a cliff, looking out into a deep dark expanse with faint stars on the horizon. Sense of anticipation, contemplation before a journey.`,
  },
  {
    id: 'step-generate',
    aspect: '1:1',
    prompt: `${STYLE} A lone silhouetted figure standing inside a single column of light pouring from above, dust and tiny particles swirling around them in the beam. Sense of transformation, energy, creation.`,
  },
  {
    id: 'step-download',
    aspect: '1:1',
    prompt: `${STYLE} A lone silhouetted figure walking away into the distance toward a glowing horizon, footprints behind, vast open landscape. Sense of completion, departure, taking something with them.`,
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
