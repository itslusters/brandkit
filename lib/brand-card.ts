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
          { type: 'div', key: 'made', props: { style: { display: 'flex', fontSize: 14, color: textColor, opacity: 0.5, marginTop: '16px' }, children: 'Made with Atriium' } },
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
            { type: 'div', key: 'credit', props: { style: { display: 'flex', fontSize: 12, color: '#a1a1aa' }, children: 'Atriium' } },
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

/**
 * DNA Card — the single-image brand artifact users share on social. 1080×1080
 * so it works natively on IG feed, Twitter, LinkedIn, Discord, and iMessage.
 *
 * Layout: dark canvas, giant brand name as the hero, a wide color palette
 * band locked to the top third, then a small editorial footer with style
 * label, typography, and a "MADE WITH ATRIIUM" ribbon. The card carries
 * three moves: confident display type, the brand's actual colors in a
 * strip people can eyeball at thumb-size, and a clear Atriium attribution
 * for the viral loop.
 */
export async function renderDNACard(args: {
  brandName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  style: string
  typography: string[]
}): Promise<Buffer> {
  const { brandName, primaryColor: p, secondaryColor: s, accentColor: a, style, typography } = args
  const paletteHex = [p, s, a]

  const jsx = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#09090b',
        position: 'relative',
      },
      children: [
        // Full-width palette band at top (1/4 of card height)
        {
          type: 'div',
          key: 'band',
          props: {
            style: { display: 'flex', width: '100%', height: 240 },
            children: paletteHex.map((hex, i) => ({
              type: 'div',
              key: `swatch-${i}`,
              props: { style: { display: 'flex', flex: 1, backgroundColor: hex } },
            })),
          },
        },
        // "MADE WITH ATRIIUM" ribbon, pinned top-right over the band
        {
          type: 'div',
          key: 'ribbon',
          props: {
            style: {
              position: 'absolute',
              top: 40,
              right: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#ffffff',
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 999,
              padding: '8px 16px',
            },
            children: [
              { type: 'span', key: 'pre', props: { style: { display: 'flex', opacity: 0.7 }, children: 'Made with' } },
              { type: 'span', key: 'kiln', props: { style: { display: 'flex' }, children: 'ATRIIUM' } },
            ],
          },
        },
        // Main canvas
        {
          type: 'div',
          key: 'main',
          props: {
            style: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '72px 64px',
            },
            children: [
              // Hero — brand name in display scale
              {
                type: 'div',
                key: 'hero',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'div',
                      key: 'eyebrow',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 18,
                          fontWeight: 600,
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          color: '#52525b',
                          marginBottom: 28,
                        },
                        children: 'Brand DNA',
                      },
                    },
                    {
                      type: 'div',
                      key: 'name',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 132,
                          fontWeight: 800,
                          color: '#ffffff',
                          letterSpacing: '-0.04em',
                          lineHeight: 0.94,
                          maxWidth: 920,
                        },
                        children: brandName,
                      },
                    },
                    {
                      type: 'div',
                      key: 'style',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: 22,
                          color: '#a1a1aa',
                          marginTop: 28,
                          maxWidth: 920,
                          lineHeight: 1.35,
                        },
                        children: style,
                      },
                    },
                  ],
                },
              },
              // Footer — typography + hex swatches
              {
                type: 'div',
                key: 'foot',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: 32,
                  },
                  children: [
                    // Typography column
                    {
                      type: 'div',
                      key: 'typo',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: 6 },
                        children: [
                          {
                            type: 'div',
                            key: 'typolabel',
                            props: {
                              style: {
                                display: 'flex',
                                fontSize: 12,
                                fontWeight: 600,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: '#52525b',
                                marginBottom: 4,
                              },
                              children: 'Typography',
                            },
                          },
                          ...typography.slice(0, 3).map((t, i) => ({
                            type: 'div',
                            key: `t${i}`,
                            props: {
                              style: { display: 'flex', fontSize: 16, color: '#d4d4d8' },
                              children: t,
                            },
                          })),
                        ],
                      },
                    },
                    // Hex row
                    {
                      type: 'div',
                      key: 'hex',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' },
                        children: [
                          {
                            type: 'div',
                            key: 'hexlabel',
                            props: {
                              style: {
                                display: 'flex',
                                fontSize: 12,
                                fontWeight: 600,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: '#52525b',
                                marginBottom: 4,
                              },
                              children: 'Palette',
                            },
                          },
                          ...paletteHex.map((hex, i) => ({
                            type: 'div',
                            key: `h${i}`,
                            props: {
                              style: { display: 'flex', fontSize: 15, color: '#d4d4d8', fontFamily: 'Inter' },
                              children: hex.toUpperCase(),
                            },
                          })),
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  } as unknown as React.ReactElement

  const satori = (await import('satori')).default
  const sharp = (await import('sharp')).default

  const svg = await satori(jsx, {
    width: 1080,
    height: 1080,
    fonts: [{ name: 'Inter', data: getInterFont(), weight: 800, style: 'normal' as const }],
  })

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}
