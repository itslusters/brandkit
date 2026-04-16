import { buildBrandGuidePDF } from '@/lib/pdf'
import { composeMockupById } from '@/lib/mockups-compose'
import { requireTier } from '@/lib/tier'
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
    const gate = await requireTier('essentials')
    if (!gate.ok) {
      return Response.json({ error: 'tier_required', message: 'Upgrade to Essentials or Pro to download the brand guide.' }, { status: 403 })
    }
    const body: RequestBody = await req.json()
    if (!body.selectedLogoDataUrl?.startsWith('data:image/')) {
      return Response.json({ error: 'invalid_logo' }, { status: 400 })
    }

    const logoBuffer = dataUrlToBuffer(body.selectedLogoDataUrl)

    // Re-compose up to 3 mockups server-side (client sends only IDs to stay under the 4.5MB body cap)
    const ids = (body.mockupTemplateIds ?? []).slice(0, 3)
    const mockupOutcomes = await Promise.allSettled(ids.map((id) => composeMockupById(id, logoBuffer)))
    const mockupPngs = mockupOutcomes
      .filter((o): o is PromiseFulfilledResult<Buffer> => o.status === 'fulfilled')
      .map((o) => o.value)

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
