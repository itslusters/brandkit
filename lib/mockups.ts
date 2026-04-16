import sharp from 'sharp'
import type { MockupTemplate } from './types'

export const MOCKUP_TEMPLATES: MockupTemplate[] = [
  { id: 'business-card',  name: 'Business Card',    category: 'print',   image: '/mockups/business-card.png',  logoZone: { x: 380, y: 240, width: 240, height: 140 }, aspectRatio: '4:3' },
  { id: 'app-icon',       name: 'App Icon',         category: 'digital', image: '/mockups/app-icon.png',       logoZone: { x: 64,  y: 64,  width: 384, height: 384 }, aspectRatio: '1:1' },
  { id: 'social-post',    name: 'Instagram Post',   category: 'social',  image: '/mockups/social-post.png',    logoZone: { x: 340, y: 340, width: 400, height: 400 }, aspectRatio: '1:1' },
  { id: 'envelope-small', name: 'Envelope (Small)', category: 'print',   image: '/mockups/envelope-small.png', logoZone: { x: 200, y: 150, width: 200, height: 100 }, aspectRatio: '4:3' },
  { id: 'envelope-large', name: 'Envelope (Large)', category: 'print',   image: '/mockups/envelope-large.png', logoZone: { x: 180, y: 120, width: 240, height: 140 }, aspectRatio: '4:3' },
  { id: 'letterhead',     name: 'Letterhead',       category: 'print',   image: '/mockups/letterhead.png',     logoZone: { x: 400, y: 80,  width: 200, height: 80  }, aspectRatio: '3:4' },
  { id: 'tshirt',         name: 'T-shirt',          category: 'merch',   image: '/mockups/tshirt.png',         logoZone: { x: 410, y: 300, width: 180, height: 180 }, aspectRatio: '1:1' },
  { id: 'mug',            name: 'Mug',              category: 'merch',   image: '/mockups/mug.png',            logoZone: { x: 280, y: 260, width: 220, height: 160 }, aspectRatio: '4:3' },
  { id: 'pen',            name: 'Pen',              category: 'merch',   image: '/mockups/pen.png',            logoZone: { x: 200, y: 280, width: 140, height: 40  }, aspectRatio: '16:9' },
]

export function getTemplateById(id: string): MockupTemplate | undefined {
  return MOCKUP_TEMPLATES.find((t) => t.id === id)
}

// Sharp memory safety:
// - resize uses fit:inside so logo stays within its zone without distorting
// - each call holds only the template buffer + resized logo buffer
// - no pipeline chaining that would retain multiple intermediate buffers
export async function composeMockup(
  templateBuffer: Buffer,
  logoBuffer: Buffer,
  zone: { x: number; y: number; width: number; height: number }
): Promise<Buffer> {
  const resizedLogo = await sharp(logoBuffer)
    .resize(zone.width, zone.height, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  return sharp(templateBuffer)
    .composite([{ input: resizedLogo, left: zone.x, top: zone.y }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}
