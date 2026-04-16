import { buildBrandGuidePDF } from '@/lib/pdf'
import type { BrandResult, MockupResult } from '@/lib/types'

interface RequestBody {
  brandName: string
  brandResult: BrandResult
  selectedLogoDataUrl: string
  mockupResults?: MockupResult[]
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const b64 = dataUrl.split(',')[1] ?? ''
  return Buffer.from(b64, 'base64')
}

export async function POST(req: Request) {
  const body: RequestBody = await req.json()
  if (!body.selectedLogoDataUrl?.startsWith('data:image/')) {
    return Response.json({ error: 'invalid_logo' }, { status: 400 })
  }

  const mockupPngs = (body.mockupResults ?? [])
    .filter((m) => m.dataUrl)
    .slice(0, 3)
    .map((m) => dataUrlToBuffer(m.dataUrl))

  const pdf = await buildBrandGuidePDF({
    brandName: body.brandName,
    result: body.brandResult,
    logoPng: dataUrlToBuffer(body.selectedLogoDataUrl),
    mockupPngs,
  })

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${body.brandName}-brand-guide.pdf"`,
    },
  })
}
