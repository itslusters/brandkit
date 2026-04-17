import 'server-only'
import sharp from 'sharp'

const OUTPUT_SIZE = 1024

// Post-process Imagen logo output for consistent studio-grade quality:
// 1. Flatten to pure white background (removes semi-transparent artifacts)
// 2. Auto-trim excess whitespace
// 3. Re-center with consistent padding
// 4. Subtle sharpen for crispness
// 5. Output as clean 1024×1024 PNG
export async function postprocessLogo(buffer: Buffer): Promise<Buffer> {
  // Fail-safe: if any step throws (e.g., invalid image data), return raw input
  try {
    return await _postprocess(buffer)
  } catch {
    return buffer
  }
}

async function _postprocess(buffer: Buffer): Promise<Buffer> {
  // Step 1: flatten to white + Step 2: auto-trim whitespace
  const trimmed = await sharp(buffer)
    .flatten({ background: '#ffffff' })
    .trim({ threshold: 20 })
    .toBuffer()

  // Step 3: get trimmed dimensions, re-center with 12% padding on each side
  const meta = await sharp(trimmed).metadata()
  const w = meta.width ?? OUTPUT_SIZE
  const h = meta.height ?? OUTPUT_SIZE
  const maxDim = Math.max(w, h)
  const targetInner = Math.round(OUTPUT_SIZE * 0.76) // 76% of canvas = 12% padding each side
  const scale = Math.min(targetInner / maxDim, 1) // don't upscale, only downscale
  const resizedW = Math.round(w * scale)
  const resizedH = Math.round(h * scale)

  const resized = await sharp(trimmed)
    .resize(resizedW, resizedH, { fit: 'inside' })
    .toBuffer()

  // Step 4: place on white canvas centered + Step 5: sharpen
  return sharp({
    create: {
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{
      input: resized,
      left: Math.round((OUTPUT_SIZE - resizedW) / 2),
      top: Math.round((OUTPUT_SIZE - resizedH) / 2),
    }])
    .sharpen({ sigma: 0.8 })
    .png({ compressionLevel: 9 })
    .toBuffer()
}
