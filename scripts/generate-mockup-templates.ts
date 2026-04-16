// Run once to generate /public/mockups/*.png using Imagen 4.
// Usage: GEMINI_API_KEY=<key> npx tsx scripts/generate-mockup-templates.ts
// Commits the resulting PNGs to the repo as static assets.

import { GoogleGenAI } from '@google/genai'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const TEMPLATES: { id: string; prompt: string }[] = [
  { id: 'business-card',  prompt: 'Blank white business card on a clean wooden desk, top-down view, soft natural window light, subtle shadow. Empty — no text, no logo, no design.' },
  { id: 'app-icon',       prompt: 'Empty rounded-square app icon template on a smartphone home screen mockup, centered, neutral gray background. No icon content, just the empty rounded square.' },
  { id: 'social-post',    prompt: 'Minimalist square Instagram post background, pale neutral gradient, empty composition. No text, no graphics.' },
  { id: 'envelope-small', prompt: 'Blank white DL envelope lying on a light marble surface, angled slightly, soft natural light. Completely blank — no printing, no logo.' },
  { id: 'envelope-large', prompt: 'Blank white C4 large envelope standing upright against a neutral cream background, soft studio lighting. Completely empty — no text.' },
  { id: 'letterhead',     prompt: 'Blank white A4 letterhead document on a dark wooden desk, top-down view, soft shadow. Completely blank page.' },
  { id: 'tshirt',         prompt: 'Blank plain white t-shirt laid flat on a light gray background, front facing, wrinkle-free, top-down view. No design, no print.' },
  { id: 'mug',            prompt: 'Plain white ceramic mug with handle facing right, on a light wooden surface, soft natural light, no text or decoration.' },
  { id: 'pen',            prompt: 'Blank white plastic pen lying horizontally on a neutral light gray surface, soft shadow, no text or logo on the barrel.' },
]

async function main() {
  const outDir = path.join(process.cwd(), 'public', 'mockups')
  await mkdir(outDir, { recursive: true })

  for (const tpl of TEMPLATES) {
    console.log(`Generating ${tpl.id}...`)
    const res = await genai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: tpl.prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/png' },
    })
    const b64 = res.generatedImages?.[0]?.image?.imageBytes
    if (!b64) {
      console.error(`FAIL: ${tpl.id} returned no image`)
      continue
    }
    const filePath = path.join(outDir, `${tpl.id}.png`)
    await writeFile(filePath, Buffer.from(b64, 'base64'))
    console.log(`  → ${filePath}`)
  }
  console.log('Done. Manually measure logoZone coordinates in Figma; update lib/mockups.ts.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
