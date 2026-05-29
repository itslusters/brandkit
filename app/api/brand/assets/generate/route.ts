import { auth } from '@clerk/nextjs/server'
import JSZip from 'jszip'
import sharp from 'sharp'
import { buildBrandGuidePDF } from '@/lib/pdf'
import { pngToSvg } from '@/lib/vector'
import { vectorizeRecraftImage } from '@/lib/recraft'
import { getLogoLimiter } from '@/lib/ratelimit'
import { requireTier, getUserTier } from '@/lib/tier'
import type { BrandResult } from '@/lib/types'

interface RequestBody {
  brandName: string
  brandResult: BrandResult
  selectedLogoDataUrl: string
  /** Persistent Blob URLs from the Recraft mockup generation step. */
  mockupUrls?: { templateId: string; url: string }[]
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const b64 = dataUrl.split(',')[1] ?? ''
  return Buffer.from(b64, 'base64')
}

async function fetchAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const arr = new Uint8Array(await res.arrayBuffer())
    return Buffer.from(arr)
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }

    const gate = await requireTier('essentials')
    if (!gate.ok) {
      return Response.json({ error: 'tier_required', message: 'Upgrade to Essentials or Pro to download the asset pack.' }, { status: 403 })
    }

    // Rate limit before hitting vectorizeRecraftImage — a PAID Recraft call.
    // Reuse the logo limiter (same tier ladder). Skipped in local dev.
    if (process.env.NODE_ENV !== 'development') {
      const tier = await getUserTier()
      const { success } = await getLogoLimiter(tier).limit(`assets:${userId}`)
      if (!success) {
        return Response.json({ error: 'rate_limited', message: 'Daily limit reached. Try again tomorrow.' }, { status: 429 })
      }
    }

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

  // Vector SVG — prefer Recraft's true multi-color vectorizer (preserves color/curves),
  // fall back to potrace monochrome silhouette if Recraft is unavailable.
  try {
    const svg = await vectorizeRecraftImage(logo1024)
    zip.file('logo/logo.svg', svg)
  } catch {
    try {
      const svg = await pngToSvg(logo1024)
      zip.file('logo/logo.svg', svg)
    } catch {
      // SVG conversion can fail on complex images; ZIP still ships without it
    }
  }

  // Rehydrate previously-generated mockups from Blob (no regeneration).
  const mockups = body.mockupUrls ?? []
  const fetched = await Promise.all(mockups.map((m) => fetchAsBuffer(m.url)))
  fetched.forEach((buf, idx) => {
    if (buf) zip.file(`mockups/${mockups[idx].templateId}.png`, buf)
  })

  // PDF brand guide — reuse the same buffers we just wrote to the ZIP (top 3)
  const mockupPngs = fetched.filter((b): b is Buffer => b !== null).slice(0, 3)
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
