/**
 * Pure color utilities — safe to import from client and server.
 * Split out from lib/gemini.ts because that module instantiates GoogleGenAI
 * at module-load time, which throws in a browser context.
 */

function tonePrefix(l: number, s: number): string {
  let lightness = ''
  if (l < 0.2) lightness = 'very dark '
  else if (l < 0.4) lightness = 'dark '
  else if (l > 0.85) lightness = 'very light '
  else if (l > 0.7) lightness = 'light '
  if (s < 0.4) return lightness ? `muted ${lightness}` : 'muted '
  return lightness
}

export function hexToColorName(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 510
  const d = max - min
  const s = d === 0 ? 0 : d / (255 - Math.abs(max + min - 255))

  if (s < 0.12) {
    if (l < 0.08) return 'black'
    if (l < 0.3) return 'dark gray'
    if (l < 0.7) return 'gray'
    if (l < 0.92) return 'light gray'
    return 'off-white'
  }

  let hue = 0
  if (max === r) hue = ((g - b) / d + 6) % 6
  else if (max === g) hue = (b - r) / d + 2
  else hue = (r - g) / d + 4
  hue = Math.round(hue * 60)

  if (hue >= 345 || hue < 15) return tonePrefix(l, s) + 'red'
  if (hue < 45) {
    if (l < 0.3 && s > 0.2) return 'brown'
    if (l > 0.85) return 'cream'
    if (l > 0.6 && s < 0.5) return 'beige'
    return tonePrefix(l, s) + 'orange'
  }
  if (hue < 65) return l < 0.4 ? 'olive' : tonePrefix(l, s) + 'yellow'
  if (hue < 150) return tonePrefix(l, s) + 'green'
  if (hue < 200) return tonePrefix(l, s) + 'teal'
  if (hue < 250) return tonePrefix(l, s) + 'blue'
  if (hue < 290) return tonePrefix(l, s) + 'purple'
  return tonePrefix(l, s) + 'pink'
}
