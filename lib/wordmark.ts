import 'server-only'
import satori from 'satori'
import sharp from 'sharp'
import { type FontEntry, loadFontBuffer } from './fonts'

export type WordmarkLayout = 'centered' | 'tracked' | 'stacked'

interface RenderArgs {
  brandName: string
  font: FontEntry
  primaryColor: string     // hex
  layout: WordmarkLayout
}

const WIDTH = 1024
const HEIGHT = 1024

// Map hex to valid CSS color (satori needs explicit # prefix)
function cssColor(hex: string): string {
  return hex.startsWith('#') ? hex : `#${hex}`
}

function buildJsx(args: RenderArgs): React.ReactElement {
  const { brandName, primaryColor, layout } = args
  const color = cssColor(primaryColor)

  if (layout === 'tracked') {
    // TRACKED CAPS — wide letterspacing, uppercase
    return {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'white', padding: '100px',
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex', color, fontSize: 56,
              fontWeight: args.font.weight,
              letterSpacing: '0.35em', textTransform: 'uppercase' as const,
            },
            children: brandName,
          },
        },
      },
    } as unknown as React.ReactElement
  }

  if (layout === 'stacked') {
    // STACKED — split name at a reasonable boundary, two lines
    const mid = Math.ceil(brandName.length / 2)
    const spaceIdx = brandName.indexOf(' ')
    const splitAt = spaceIdx > 0 && spaceIdx < brandName.length * 0.7 ? spaceIdx : mid
    const line1 = brandName.slice(0, splitAt).trim()
    const line2 = brandName.slice(splitAt).trim()

    return {
      type: 'div',
      props: {
        style: {
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'white', padding: '80px',
          flexDirection: 'column',
        },
        children: [
          { type: 'div', key: '1', props: { style: { display: 'flex', color, fontSize: 80, fontWeight: args.font.weight, lineHeight: 1.1 }, children: line1 } },
          { type: 'div', key: '2', props: { style: { display: 'flex', color, fontSize: 80, fontWeight: args.font.weight, lineHeight: 1.1 }, children: line2 } },
        ],
      },
    } as unknown as React.ReactElement
  }

  // CENTERED — default
  return {
    type: 'div',
    props: {
      style: {
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'white', padding: '80px',
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex', color, fontSize: 96,
            fontWeight: args.font.weight,
            letterSpacing: '-0.02em',
          },
          children: brandName,
        },
      },
    },
  } as unknown as React.ReactElement
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

export const WORDMARK_LAYOUTS: WordmarkLayout[] = ['centered', 'tracked', 'stacked']
