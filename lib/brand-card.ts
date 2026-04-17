import 'server-only'
import satori from 'satori'
import sharp from 'sharp'
import { readFileSync } from 'fs'
import path from 'path'

interface CardArgs {
  brandName: string
  logoBuffer: Buffer   // PNG logo
  primaryColor: string
  secondaryColor: string
  accentColor: string
  style: string        // recommendedStyle text
  variant: 'dark-hero' | 'color-block' | 'editorial-grid'
}

const WIDTH = 1080
const HEIGHT = 1350 // Instagram portrait

function cssColor(hex: string): string {
  return hex.startsWith('#') ? hex : `#${hex}`
}

// Load Inter for card text (brand name label, style label)
let interFont: ArrayBuffer | null = null
function getInterFont(): ArrayBuffer {
  if (interFont) return interFont
  const buf = readFileSync(path.join(process.cwd(), 'public', 'fonts', 'Inter-var.ttf'))
  interFont = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  return interFont
}

function isColorDark(hex: string): boolean {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

function buildCardJsx(args: CardArgs): React.ReactElement {
  const { brandName, primaryColor, secondaryColor, accentColor, style, variant } = args
  const p = cssColor(primaryColor)
  const s = cssColor(secondaryColor)
  const a = cssColor(accentColor)

  if (variant === 'dark-hero') {
    return {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#0a0a0b', padding: '100px', gap: '48px',
        },
        children: [
          // Logo placeholder (white circle with brand initial)
          { type: 'div', key: 'logo-area', props: {
            style: { display: 'flex', width: 200, height: 200, borderRadius: 100, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
            children: { type: 'div', props: { style: { display: 'flex', fontSize: 80, fontWeight: 700, color: p }, children: brandName[0] } },
          }},
          { type: 'div', key: 'name', props: { style: { display: 'flex', fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }, children: brandName } },
          { type: 'div', key: 'style', props: { style: { display: 'flex', fontSize: 18, color: '#71717a' }, children: style } },
          // Palette strip
          { type: 'div', key: 'palette', props: {
            style: { display: 'flex', gap: '12px', marginTop: '24px' },
            children: [
              { type: 'div', key: 'c1', props: { style: { display: 'flex', width: 40, height: 40, borderRadius: 20, backgroundColor: p } } },
              { type: 'div', key: 'c2', props: { style: { display: 'flex', width: 40, height: 40, borderRadius: 20, backgroundColor: s } } },
              { type: 'div', key: 'c3', props: { style: { display: 'flex', width: 40, height: 40, borderRadius: 20, backgroundColor: a } } },
            ],
          }},
        ],
      },
    } as unknown as React.ReactElement
  }

  if (variant === 'color-block') {
    const isDark = isColorDark(primaryColor)
    const textColor = isDark ? '#ffffff' : '#0a0a0b'

    return {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%', display: 'flex',
          flexDirection: 'column', justifyContent: 'flex-end',
          backgroundColor: p, padding: '80px',
        },
        children: [
          { type: 'div', key: 'name', props: { style: { display: 'flex', fontSize: 72, fontWeight: 800, color: textColor, letterSpacing: '-0.03em', lineHeight: 1 }, children: brandName } },
          { type: 'div', key: 'dot', props: { style: { display: 'flex', width: 12, height: 12, borderRadius: 6, backgroundColor: a, marginTop: '24px' } } },
          { type: 'div', key: 'made', props: { style: { display: 'flex', fontSize: 14, color: textColor, opacity: 0.5, marginTop: '16px' }, children: 'Made with BrandKit' } },
        ],
      },
    } as unknown as React.ReactElement
  }

  // editorial-grid — white bg, structured layout
  return {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', backgroundColor: '#ffffff', padding: '80px',
        justifyContent: 'space-between',
      },
      children: [
        // Top: brand name large
        { type: 'div', key: 'top', props: {
          style: { display: 'flex', flexDirection: 'column' },
          children: [
            { type: 'div', key: 'name', props: { style: { display: 'flex', fontSize: 64, fontWeight: 800, color: '#0a0a0b', letterSpacing: '-0.03em', lineHeight: 1 }, children: brandName } },
            { type: 'div', key: 'style', props: { style: { display: 'flex', fontSize: 16, color: '#71717a', marginTop: '16px' }, children: style } },
          ],
        }},
        // Bottom: palette + branding
        { type: 'div', key: 'bottom', props: {
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
          children: [
            { type: 'div', key: 'palette', props: {
              style: { display: 'flex', gap: '8px' },
              children: [
                { type: 'div', key: 'c1', props: { style: { display: 'flex', width: 48, height: 48, borderRadius: 8, backgroundColor: p } } },
                { type: 'div', key: 'c2', props: { style: { display: 'flex', width: 48, height: 48, borderRadius: 8, backgroundColor: s } } },
                { type: 'div', key: 'c3', props: { style: { display: 'flex', width: 48, height: 48, borderRadius: 8, backgroundColor: a } } },
              ],
            }},
            { type: 'div', key: 'credit', props: { style: { display: 'flex', fontSize: 12, color: '#a1a1aa' }, children: 'BrandKit' } },
          ],
        }},
      ],
    },
  } as unknown as React.ReactElement
}

export async function renderBrandCard(args: CardArgs): Promise<Buffer> {
  const svg = await satori(buildCardJsx(args), {
    width: WIDTH,
    height: HEIGHT,
    fonts: [{
      name: 'Inter',
      data: getInterFont(),
      weight: 700,
      style: 'normal' as const,
    }],
  })

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}

export const BRAND_CARD_VARIANTS: CardArgs['variant'][] = ['dark-hero', 'color-block', 'editorial-grid']
