import 'server-only'
import sharp from 'sharp'

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
