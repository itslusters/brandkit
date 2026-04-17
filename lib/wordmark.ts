import 'server-only'
import satori from 'satori'
import sharp from 'sharp'
import { type FontEntry, loadFontBuffer } from './fonts'

export type WordmarkLayout = 'hero-dark' | 'hero-color' | 'monogram-bold'

interface RenderArgs {
  brandName: string
  font: FontEntry
  primaryColor: string
  secondaryColor: string
  layout: WordmarkLayout
}

const WIDTH = 1080
const HEIGHT = 1080

function cssColor(hex: string): string {
  return hex.startsWith('#') ? hex : `#${hex}`
}

function buildJsx(args: RenderArgs): React.ReactElement {
  const { brandName, primaryColor, secondaryColor, layout } = args
  const primary = cssColor(primaryColor)
  const secondary = cssColor(secondaryColor)

  if (layout === 'hero-dark') {
    // Dark background, large centered type — A24 / bold poster style
    return {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#0a0a0b', padding: '120px',
          flexDirection: 'column',
        },
        children: [
          {
            type: 'div',
            key: 'name',
            props: {
              style: {
                display: 'flex', color: '#ffffff', fontSize: 108,
                fontWeight: args.font.weight,
                letterSpacing: '-0.03em', lineHeight: 1,
                textAlign: 'center',
              },
              children: brandName,
            },
          },
          {
            type: 'div',
            key: 'accent',
            props: {
              style: {
                display: 'flex', width: 60, height: 4,
                backgroundColor: primary, borderRadius: 2,
                marginTop: 40,
              },
              children: '',
            },
          },
        ],
      },
    } as unknown as React.ReactElement
  }

  const isDarkBg = isColorDark(primary)

  if (layout === 'hero-color') {
    const textColor = isDarkBg ? '#ffffff' : '#0a0a0b'

    return {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'flex-end', justifyContent: 'flex-start',
          backgroundColor: primary, padding: '80px',
        },
        children: [
          {
            type: 'div',
            key: 'name',
            props: {
              style: {
                display: 'flex', color: textColor, fontSize: 96,
                fontWeight: args.font.weight,
                letterSpacing: '-0.02em', lineHeight: 1.05,
              },
              children: brandName,
            },
          },
        ],
      },
    } as unknown as React.ReactElement
  }

  // monogram-bold — oversized first letter + small brand name, high contrast
  const initial = brandName[0]?.toUpperCase() ?? 'B'
  return {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: primary, position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Giant letter
        {
          type: 'div',
          key: 'mono',
          props: {
            style: {
              display: 'flex', fontSize: 600,
              fontWeight: args.font.weight,
              color: 'rgba(255,255,255,0.08)', lineHeight: 0.8,
              position: 'absolute',
            },
            children: initial,
          },
        },
        // Brand name centered
        {
          type: 'div',
          key: 'name',
          props: {
            style: {
              display: 'flex', fontSize: 36,
              fontWeight: args.font.weight,
              color: isDarkBg ? '#ffffff' : '#0a0a0b',
              letterSpacing: '0.15em', textTransform: 'uppercase' as const,
              position: 'relative',
            },
            children: brandName,
          },
        },
      ],
    },
  } as unknown as React.ReactElement
}

function isColorDark(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export async function renderWordmark(args: RenderArgs): Promise<Buffer> {
  const fontData = loadFontBuffer(args.font)

  const svg = await satori(buildJsx(args), {
    width: WIDTH,
    height: HEIGHT,
    fonts: [{
      name: args.font.family,
      data: fontData,
      weight: args.font.weight as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
      style: 'normal',
    }],
  })

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}

export const WORDMARK_LAYOUTS: WordmarkLayout[] = ['hero-dark', 'hero-color', 'monogram-bold']
