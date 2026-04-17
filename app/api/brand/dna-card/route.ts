import { renderDNACard } from '@/lib/brand-card'
import type { BrandResult } from '@/lib/types'

interface RequestBody {
  brandName: string
  brandResult: BrandResult
}

export async function POST(req: Request) {
  try {
    const { brandName, brandResult }: RequestBody = await req.json()
    const { colorPalette, recommendedStyle, typography } = brandResult.styleBrief

    const png = await renderDNACard({
      brandName,
      primaryColor: colorPalette[0] ?? '#18181b',
      secondaryColor: colorPalette[1] ?? '#ffffff',
      accentColor: colorPalette[2] ?? '#3b82f6',
      style: recommendedStyle,
      typography,
    })

    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${brandName}-dna-card.png"`,
      },
    })
  } catch (err) {
    console.error('[dna-card] error:', err)
    return Response.json({ error: 'Failed to generate card' }, { status: 500 })
  }
}
