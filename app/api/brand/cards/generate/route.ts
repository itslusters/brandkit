import { renderBrandCard, BRAND_CARD_VARIANTS } from '@/lib/brand-card'
import type { BrandResult } from '@/lib/types'

interface RequestBody {
  brandName: string
  brandResult: BrandResult
  selectedLogoDataUrl: string
}

function dataUrlToBuffer(dataUrl: string): Buffer {
  const b64 = dataUrl.split(',')[1] ?? ''
  return Buffer.from(b64, 'base64')
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json()
    const { colorPalette, recommendedStyle } = body.brandResult.styleBrief
    const logoBuffer = dataUrlToBuffer(body.selectedLogoDataUrl)

    const outcomes = await Promise.allSettled(
      BRAND_CARD_VARIANTS.map(async (variant) => {
        const png = await renderBrandCard({
          brandName: body.brandName,
          logoBuffer,
          primaryColor: colorPalette[0] ?? '#18181b',
          secondaryColor: colorPalette[1] ?? '#ffffff',
          accentColor: colorPalette[2] ?? '#3b82f6',
          style: recommendedStyle,
          variant,
        })
        return { variant, dataUrl: `data:image/png;base64,${png.toString('base64')}` }
      })
    )

    const cards = outcomes
      .filter((o) => o.status === 'fulfilled')
      .map((o) => (o as PromiseFulfilledResult<{ variant: string; dataUrl: string }>).value)

    return Response.json({ cards })
  } catch (err) {
    console.error('[cards/generate] error:', err)
    return Response.json(
      { error: 'cards_failed', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
