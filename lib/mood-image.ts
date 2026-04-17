import 'server-only'
import satori from 'satori'
import sharp from 'sharp'
import { readFileSync } from 'fs'
import path from 'path'

interface MoodArgs {
  brandName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  variant: 'gradient-orb' | 'color-field' | 'minimal-type'
}

const WIDTH = 1080
const HEIGHT = 1350

let interFont: ArrayBuffer | null = null
function getInterFont(): ArrayBuffer {
  if (interFont) return interFont
  const buf = readFileSync(path.join(process.cwd(), 'public', 'fonts', 'Inter-var.ttf'))
  interFont = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  return interFont
}

function buildMoodJsx(args: MoodArgs): React.ReactElement {
  const { brandName, primaryColor: p, secondaryColor: s, accentColor: a, variant } = args

  if (variant === 'gradient-orb') {
    // Soft gradient orb on dark bg — very Pinterest/Savee aesthetic
    return {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#0a0a0b', position: 'relative',
        },
        children: [
          // Large blurred orb
          { type: 'div', key: 'orb', props: {
            style: {
              display: 'flex', position: 'absolute',
              width: 600, height: 600, borderRadius: 300,
              background: `radial-gradient(circle, ${p}80, ${s}40, transparent)`,
              filter: 'blur(80px)',
            },
          }},
          // Small accent orb
          { type: 'div', key: 'accent', props: {
            style: {
              display: 'flex', position: 'absolute',
              width: 200, height: 200, borderRadius: 100,
              background: `radial-gradient(circle, ${a}60, transparent)`,
              filter: 'blur(40px)',
              top: '25%', right: '20%',
            },
          }},
          // Brand initial
          { type: 'div', key: 'initial', props: {
            style: { display: 'flex', fontSize: 120, fontWeight: 800, color: 'rgba(255,255,255,0.08)', position: 'absolute' },
            children: brandName[0]?.toUpperCase() ?? '',
          }},
        ],
      },
    } as unknown as React.ReactElement
  }

  if (variant === 'color-field') {
    // Rothko-inspired color field — two horizontal bands
    return {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%', display: 'flex',
          flexDirection: 'column', padding: '60px',
          backgroundColor: s, gap: '30px',
        },
        children: [
          { type: 'div', key: 'top', props: {
            style: { display: 'flex', flex: 3, borderRadius: 16, backgroundColor: p },
          }},
          { type: 'div', key: 'bottom', props: {
            style: { display: 'flex', flex: 2, borderRadius: 16, backgroundColor: a },
          }},
        ],
      },
    } as unknown as React.ReactElement
  }

  // minimal-type — huge letter on colored bg
  return {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'flex-end', justifyContent: 'flex-start',
        backgroundColor: p, padding: '60px',
      },
      children: [
        { type: 'div', key: 'letter', props: {
          style: {
            display: 'flex', fontSize: 500, fontWeight: 900,
            color: 'rgba(0,0,0,0.15)', lineHeight: 0.8,
            position: 'absolute', top: '-60px', right: '-40px',
          },
          children: brandName[0]?.toUpperCase() ?? '',
        }},
        { type: 'div', key: 'name', props: {
          style: { display: 'flex', fontSize: 24, fontWeight: 700, color: s, position: 'relative' },
          children: brandName,
        }},
      ],
    },
  } as unknown as React.ReactElement
}

export async function renderMoodImage(args: MoodArgs): Promise<Buffer> {
  const svg = await satori(buildMoodJsx(args), {
    width: WIDTH,
    height: HEIGHT,
    fonts: [{
      name: 'Inter',
      data: getInterFont(),
      weight: 800,
      style: 'normal' as const,
    }],
  })

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}

export const MOOD_VARIANTS: MoodArgs['variant'][] = ['gradient-orb', 'color-field', 'minimal-type']
