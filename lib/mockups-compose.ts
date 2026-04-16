import 'server-only'
import sharp from 'sharp'
import { readFile } from 'fs/promises'
import path from 'path'
import { getTemplateById } from './mockups'

// Threshold for "near-white" pixels that get alpha=0 (makes logo background transparent)
const WHITE_THRESHOLD = 240

async function makeWhiteTransparent(buffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Set alpha=0 for near-white pixels so the logo floats on any surface
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > WHITE_THRESHOLD && data[i + 1] > WHITE_THRESHOLD && data[i + 2] > WHITE_THRESHOLD) {
      data[i + 3] = 0
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer()
}

// Sharp memory safety:
// - single raw pass to strip white, single resize, single composite — no chains holding intermediates
// - resize uses fit:inside so logo stays within its zone without distorting
export async function composeMockup(
  templateBuffer: Buffer,
  logoBuffer: Buffer,
  zone: { x: number; y: number; width: number; height: number }
): Promise<Buffer> {
  const transparentLogo = await makeWhiteTransparent(logoBuffer)

  const resizedLogo = await sharp(transparentLogo)
    .resize(zone.width, zone.height, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  return sharp(templateBuffer)
    .composite([{ input: resizedLogo, left: zone.x, top: zone.y }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

export async function composeMockupById(id: string, logoBuffer: Buffer): Promise<Buffer> {
  const tpl = getTemplateById(id)
  if (!tpl) throw new Error(`unknown template: ${id}`)
  const templatePath = path.join(process.cwd(), 'public', tpl.image.replace(/^\//, ''))
  const templateBuffer = await readFile(templatePath)
  return composeMockup(templateBuffer, logoBuffer, tpl.logoZone)
}
