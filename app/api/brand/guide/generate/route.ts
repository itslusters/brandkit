import { auth } from '@clerk/nextjs/server'
import { buildBrandGuidePDF } from '@/lib/pdf'
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
      return Response.json({ error: 'tier_required', message: 'Upgrade to Essentials or Pro to download the brand guide.' }, { status: 403 })
    }

    // Rate limit before building the PDF (CPU-bound + potential mockup fetches).
    // Reuse the logo limiter (same tier ladder). Skipped in local dev.
    if (process.env.NODE_ENV !== 'development') {
      const tier = await getUserTier()
      const { success } = await getLogoLimiter(tier).limit(`guide:${userId}`)
      if (!success) {
        return Response.json({ error: 'rate_limited', message: 'Daily limit reached. Try again tomorrow.' }, { status: 429 })
      }
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
