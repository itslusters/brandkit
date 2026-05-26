// Maps a raw industry string to a strong aesthetic anchor that downstream
// Recraft prompts (logo / mood / mockup) lock onto before they read the brief's
// recommendedStyle. Without this the only category signal in image prompts was
// the brief, which the LLM tends to flatten into a generic editorial vibe
// regardless of input. Returns an empty string for industries outside the
// curated set so callers can fall through to a category-blind prompt.

export function industryAnchor(industry: string): string {
  const i = industry.toLowerCase()
  if (/\b(saas|software|tech|fintech|api|cloud|platform|developer|ai|ml|b2b|crypto|web3|cyber)\b/.test(i)) {
    return 'TECH-PRODUCT IDENTITY: geometric, monoline, monochromatic, grid-based. No serifs, no magazine framing, no human figures.'
  }
  if (/\b(food|restaurant|cafe|bakery|beverage|drink|culinary|kitchen|grocery)\b/.test(i)) {
    return 'FOOD & BEVERAGE IDENTITY: warm, appetite-driven, hand-finished, organic curves. No sterile tech monoline.'
  }
  if (/\b(wellness|fitness|yoga|spa|health|mindfulness|meditation|skincare)\b/.test(i)) {
    return 'WELLNESS IDENTITY: calm, restrained, breathing, soft. No aggressive contrast.'
  }
  if (/\b(finance|bank|invest|wealth|asset|insurance|accounting)\b/.test(i)) {
    return 'FINANCE IDENTITY: refined, serious, structural, trustworthy. No playful gestures.'
  }
  if (/\b(fashion|apparel|beauty|cosmetic|jewelry|luxury\s*goods)\b/.test(i)) {
    return 'FASHION IDENTITY: elegant, contemporary, minimal, premium. No tech monoline.'
  }
  if (/\b(publishing|magazine|media|newsletter|literary|book|editorial)\b/.test(i)) {
    return 'PUBLISHING IDENTITY: editorial, serif-forward, gallery feel.'
  }
  if (/\b(education|school|learning|tutor|academy|course)\b/.test(i)) {
    return 'EDUCATION IDENTITY: approachable, structured, intelligent without austere.'
  }
  if (/\b(real\s*estate|property|architecture|construction|interior)\b/.test(i)) {
    return 'PROPERTY / ARCHITECTURE IDENTITY: structural, grounded, geometric, refined.'
  }
  return ''
}

// Pick the Recraft V3 named style that best matches the brief. Logos were
// previously hardcoded to vector_illustration regardless of brief — fine for a
// SaaS brand, awkward for a brand whose brief recommends a hand-crafted or
// illustrated identity. This routes to digital_illustration when the brief
// reads as illustrated/hand-drawn, and to `icon` when the brief is explicitly
// symbolic and the user asked for a symbol-only mark. Default stays
// vector_illustration so unrecognized cues don't degrade the standard path.
export type LogoNamedStyle = 'vector_illustration' | 'digital_illustration' | 'icon'

export function pickLogoStyle(
  recommendedStyle: string,
  logoType: 'wordmark' | 'symbol-text' | 'emblem',
): LogoNamedStyle {
  const s = recommendedStyle.toLowerCase()
  if (/\b(illustrat|hand[-\s]?drawn|painted|watercolor|sketch|cartoon|whimsical|playful|hand[-\s]?lettered|artisan)\b/.test(s)) {
    return 'digital_illustration'
  }
  if (logoType === 'symbol-text' && /\b(iconic|symbol|glyph|monogram|abstract\s*mark)\b/.test(s)) {
    return 'icon'
  }
  return 'vector_illustration'
}

// Specific typeface family signal — Recraft picks letterforms more reliably
// when the prompt names real type-designer references than when it just sees
// "geometric sans-serif". Names are stylistic anchors, not literal license
// requirements; the model renders glyphs in their family rather than copying
// the actual fonts. Returns empty for unmatched industries so callers keep
// the brief's typography signal as the only family hint.
export function industryTypefaceHint(industry: string): string {
  const i = industry.toLowerCase()
  if (/\b(saas|software|tech|fintech|api|cloud|platform|developer|ai|ml|b2b|crypto|web3|cyber)\b/.test(i)) {
    return 'Typefaces like Inter, Founders Grotesk, GT America (geometric grotesk).'
  }
  if (/\b(food|restaurant|cafe|bakery|beverage|drink|culinary|kitchen|grocery)\b/.test(i)) {
    return 'Typefaces like Söhne, Tiempos Text, GT Walsheim (humanist warmth).'
  }
  if (/\b(wellness|fitness|yoga|spa|health|mindfulness|meditation|skincare)\b/.test(i)) {
    return 'Typefaces like GT Sectra, Söhne Light, Tiempos Headline (refined, breathing).'
  }
  if (/\b(finance|bank|invest|wealth|asset|insurance|accounting)\b/.test(i)) {
    return 'Typefaces like Söhne, GT America, Maison Neue (structural, serious).'
  }
  if (/\b(fashion|apparel|beauty|cosmetic|jewelry|luxury\s*goods)\b/.test(i)) {
    return 'Typefaces like Tiempos Headline, GT Super, Romain Grotesque (elegant, high-contrast).'
  }
  if (/\b(publishing|magazine|media|newsletter|literary|book|editorial)\b/.test(i)) {
    return 'Typefaces like Tiempos Text, Source Serif, GT Sectra (editorial serif).'
  }
  if (/\b(education|school|learning|tutor|academy|course)\b/.test(i)) {
    return 'Typefaces like GT Walsheim, Söhne, Inter (friendly geometric grotesk).'
  }
  if (/\b(real\s*estate|property|architecture|construction|interior)\b/.test(i)) {
    return 'Typefaces like Söhne, GT America, Maison Neue (structural, restrained).'
  }
  return ''
}

// Short scene cue used by mockup prompts so the surface a brand sits on matches
// the category. Photorealistic mockup scenes that ignore this end up putting
// SaaS brands on bakery wooden tables and so on. Returns empty for unmatched
// industries so callers keep the original prop.
export function industryMockupSurface(industry: string): string {
  const i = industry.toLowerCase()
  if (/\b(saas|software|tech|fintech|api|cloud|platform|developer|ai|ml|b2b|crypto|web3|cyber)\b/.test(i)) {
    return 'minimalist tech studio surface — matte concrete or brushed metal, cool neutral palette, no organic props'
  }
  if (/\b(food|restaurant|cafe|bakery|beverage|drink|culinary|kitchen|grocery)\b/.test(i)) {
    return 'warm wooden table or natural linen surface, soft daylight, hint of botanical or kitchen prop'
  }
  if (/\b(wellness|fitness|yoga|spa|health|mindfulness|meditation|skincare)\b/.test(i)) {
    return 'soft linen or stone surface, diffused morning light, single botanical accent, breathing whitespace'
  }
  if (/\b(finance|bank|invest|wealth|asset|insurance|accounting)\b/.test(i)) {
    return 'polished dark wood or marble desk surface, refined and structural, restrained props'
  }
  if (/\b(fashion|apparel|beauty|cosmetic|jewelry|luxury\s*goods)\b/.test(i)) {
    return 'soft fabric or pale marble surface, editorial lighting, premium minimal styling'
  }
  if (/\b(publishing|magazine|media|newsletter|literary|book|editorial)\b/.test(i)) {
    return 'matte paper or linen-bound book surface, considered editorial styling'
  }
  if (/\b(education|school|learning|tutor|academy|course)\b/.test(i)) {
    return 'clean light desk surface with subtle paper texture, friendly but professional'
  }
  if (/\b(real\s*estate|property|architecture|construction|interior)\b/.test(i)) {
    return 'architectural concrete or stone surface, structural shadows, refined props'
  }
  return ''
}
