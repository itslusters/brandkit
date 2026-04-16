import JSZip from 'jszip'
import sharp from 'sharp'
import { buildBrandGuidePDF } from '@/lib/pdf'
import { pngToSvg } from '@/lib/vector'
import { composeMockupById } from '@/lib/mockups-compose'
import type { BrandResult } from '@/lib/types'

interface RequestBody {
  brandName: string
  brandResult: BrandResult
  selectedLogoDataUrl: string
  mockupTemplateIds?: string[]
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const b64 = dataUrl.split(',')[1] ?? ''
  return Buffer.from(b64, 'base64')
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json()
    if (!body.selectedLogoDataUrl?.startsWith('data:image/')) {
      return Response.json({ error: 'invalid_logo' }, { status: 400 })
    }

    const logoBuffer = dataUrlToBuffer(body.selectedLogoDataUrl)
    const zip = new JSZip()

  // Logo in 3 resolutions — sharp.resize with fit:inside keeps aspect + bounded memory
  const [logo1024, logo512, logo256] = await Promise.all([
    sharp(logoBuffer).resize(1024, 1024, { fit: 'inside' }).png().toBuffer(),
    sharp(logoBuffer).resize(512, 512, { fit: 'inside' }).png().toBuffer(),
    sharp(logoBuffer).resize(256, 256, { fit: 'inside' }).png().toBuffer(),
  ])
  zip.file('logo/logo-1024.png', logo1024)
  zip.file('logo/logo-512.png', logo512)
  zip.file('logo/logo-256.png', logo256)

  // Vector SVG
  try {
    const svg = await pngToSvg(logo1024)
    zip.file('logo/logo.svg', svg)
  } catch {
    // SVG conversion can fail on complex images; ZIP still ships without it
  }

  // Re-compose all selected mockups server-side (client sends only IDs)
  const ids = body.mockupTemplateIds ?? []
  const mockupOutcomes = await Promise.allSettled(ids.map((id) => composeMockupById(id, logoBuffer)))
  mockupOutcomes.forEach((outcome, idx) => {
    if (outcome.status === 'fulfilled') {
      zip.file(`mockups/${ids[idx]}.png`, outcome.value)
    }
  })

  // PDF brand guide — reuse the mockup buffers we just composed (top 3)
  const mockupPngs = mockupOutcomes
    .filter((o): o is PromiseFulfilledResult<Buffer> => o.status === 'fulfilled')
    .slice(0, 3)
    .map((o) => o.value)
  const pdf = await buildBrandGuidePDF({
    brandName: body.brandName,
    result: body.brandResult,
    logoPng: logoBuffer,
    mockupPngs,
  })
  zip.file('brand-guide.pdf', pdf)

  // brand-info.txt
  const palette = body.brandResult.styleBrief.colorPalette.join(', ')
  const fonts = body.brandResult.styleBrief.typography.join(', ')
  zip.file(
    'brand-info.txt',
    `Brand: ${body.brandName}\nStyle: ${body.brandResult.styleBrief.recommendedStyle}\nPalette: ${palette}\nTypography: ${fonts}\nGenerated: ${new Date().toISOString()}\n`
  )

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    return new Response(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${body.brandName}-brand-kit.zip"`,
      },
    })
  } catch (err) {
    console.error('[assets/generate] error:', err)
    return Response.json(
      { error: 'zip_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
