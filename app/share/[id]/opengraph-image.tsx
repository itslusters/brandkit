import { ImageResponse } from 'next/og'
import { getPublicBrand } from '@/lib/brands'

export const runtime = 'edge'
export const alt = 'Brand kit'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Params { params: { id: string } }

export default async function Image({ params }: Params) {
  const brand = await getPublicBrand(params.id)
  const name = brand?.name ?? 'Kiln'
  const style = brand?.brandResult.styleBrief.recommendedStyle ?? 'AI-generated brand kit'
  const logoUrl = brand?.selectedLogoUrl

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          padding: '80px',
        }}
      >
        {logoUrl && (
          <div style={{ display: 'flex', marginBottom: '48px', backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} width={200} height={200} style={{ objectFit: 'contain' }} alt="" />
          </div>
        )}
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.03em', display: 'flex' }}>
          {name}
        </div>
        <div style={{ fontSize: 28, color: '#a1a1aa', marginTop: '16px', display: 'flex', textAlign: 'center' }}>
          {style}
        </div>
        <div style={{ position: 'absolute', bottom: 40, right: 60, fontSize: 20, color: '#71717a', display: 'flex' }}>
          Made with Kiln
        </div>
      </div>
    ),
    size
  )
}
