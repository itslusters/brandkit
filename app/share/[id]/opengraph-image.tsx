import { ImageResponse } from 'next/og'
import { getPublicBrand } from '@/lib/brands'

export const runtime = 'edge'
export const alt = 'Brand kit — made with Kiln'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Params { params: { id: string } }

export default async function Image({ params }: Params) {
  const brand = await getPublicBrand(params.id)
  const name = brand?.name ?? 'Kiln'
  const style = brand?.brandResult.styleBrief.recommendedStyle ?? 'AI-generated brand kit'
  const logoUrl = brand?.selectedLogoUrl
  const palette = (brand?.brandResult.styleBrief.colorPalette ?? ['#09090b', '#18181b', '#3f3f46', '#71717a', '#a1a1aa']).slice(0, 5)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#09090b',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Ribbon — top-right Kiln attribution */}
        <div
          style={{
            position: 'absolute',
            top: 44,
            right: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#a1a1aa',
            border: '1px solid #27272a',
            borderRadius: 999,
            padding: '10px 18px',
          }}
        >
          Made with <span style={{ color: '#ffffff' }}>Kiln</span>
        </div>

        {/* Body — logo on left, name + style on right */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            padding: '80px 80px 0 80px',
            gap: 64,
          }}
        >
          {logoUrl && (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#ffffff',
                padding: '44px',
                borderRadius: '36px',
                width: 320,
                height: 320,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} width={232} height={232} style={{ objectFit: 'contain' }} alt="" />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#71717a',
                marginBottom: 20,
                display: 'flex',
              }}
            >
              Brand kit
            </div>
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 0.98,
                display: 'flex',
                maxWidth: 620,
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: 28,
                color: '#a1a1aa',
                marginTop: 20,
                display: 'flex',
                maxWidth: 620,
                lineHeight: 1.3,
              }}
            >
              {style}
            </div>
          </div>
        </div>

        {/* Palette band — full-width strip at the bottom */}
        <div style={{ display: 'flex', height: 80, width: '100%' }}>
          {palette.map((hex, i) => (
            <div
              key={`${hex}-${i}`}
              style={{
                flex: 1,
                backgroundColor: hex,
                display: 'flex',
              }}
            />
          ))}
        </div>
      </div>
    ),
    size
  )
}
