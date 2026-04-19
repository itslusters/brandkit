import 'server-only'
import sharp from 'sharp'

// Watermark spec: "ATRIIUM" text, opacity 0.18, rotated -30°, scaled to 70% of input width.
// Memory safety: processes only one buffer chain at a time, no intermediate retention.
export async function applyWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const { width = 1024, height = 1024 } = await sharp(imageBuffer).metadata()
  const wmWidth = Math.round(width * 0.7)
  const wmHeight = Math.round(wmWidth * 0.25) // text aspect ~ 4:1

  // SVG with rotated text, white fill at 0.18 opacity. Sharp can rasterize SVG.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${wmWidth}" height="${wmHeight}" viewBox="0 0 ${wmWidth} ${wmHeight}">
    <g transform="rotate(-30 ${wmWidth / 2} ${wmHeight / 2})">
      <text x="50%" y="50%" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(wmHeight * 0.7)}" font-weight="900" text-anchor="middle" dominant-baseline="middle" fill="white" fill-opacity="0.18">ATRIIUM</text>
    </g>
  </svg>`

  const watermarkPng = await sharp(Buffer.from(svg)).png().toBuffer()

  return sharp(imageBuffer)
    .composite([{ input: watermarkPng, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}
