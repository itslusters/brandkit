import { buildBrandGuidePDF } from '@/lib/pdf'
import { requireTier } from '@/lib/tier'
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
    const gate = await requireTier('essentials')
    if (!gate.ok) {
      return Response.json({ error: 'tier_required', message: 'Upgrade to Essentials or Pro to download the brand guide.' }, { status: 403 })
    }
    const body: RequestBody = await req.json()
    if (!body.selectedLogoDataUrl?.startsWith('data:image/')) {
      return Response.json({ error: 'invalid_logo' }, { status: 400 })
    }

    const logoBuffer = dataUrlToBuffer(body.selectedLogoDataUrl)

    // Fetch up to 3 previously-generated mockups from Blob. The mockups
    // were rendered by Recraft + uploaded during /api/brand/mockup/generate,
    // so we skip regeneration (expensive) and rehydrate from their URLs.
    const urls = (body.mockupUrls ?? []).slice(0, 3).map((m) => m.url)
    const fetched = await Promise.all(urls.map((u) => fetchAsBuffer(u)))
    const mockupPngs = fetched.filter((b): b is Buffer => b !== null)

    const pdf = await buildBrandGuidePDF({
      brandName: body.brandName,
      result: body.brandResult,
      logoPng: logoBuffer,
      mockupPngs,
    })

    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${body.brandName}-brand-guide.pdf"`,
      },
    })
  } catch (err) {
    console.error('[guide/generate] error:', err)
    return Response.json(
      { error: 'pdf_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
