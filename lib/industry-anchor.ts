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
