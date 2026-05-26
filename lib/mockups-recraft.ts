import 'server-only'
import { generateRecraftImage } from './recraft'
import { hexToColorName } from './colors'
import { industryAnchor, industryMockupSurface } from './industry-anchor'
import type { BrandInput, BrandResult } from './types'

/**
 * Recraft-driven mockup generation.
 *
 * Each template ID maps to a photorealistic scene prompt that weaves in the
 * brand name, palette color names, and typography hint from the style
 * brief. The generated logo is not composited — the scene carries the
 * brand *name* (rendered as text by Recraft) + aesthetic cues. Users who
 * need precise logo placement get the clean logo PNG download + optional
 * designer polish on paid tiers.
 *
 * Every prompt renders at 1024×1024 — Recraft V3 is safest on the square
 * dimension, and keeping one size across templates avoids per-template
 * "unsupported size" failures we were seeing in production.
 */

type MockupId =
  | 'business-card'
  | 'app-icon'
  | 'social-post'
  | 'envelope-small'
  | 'envelope-large'
  | 'letterhead'
  | 'tshirt'
  | 'mug'
  | 'pen'

interface PromptContext {
  brandName: string
  primary: string
  secondary: string
  accent: string
  style: string
  typography: string
  industry: string
  /** Strong category cue from industryAnchor (may be empty). */
  anchor: string
  /** Surface/scene hint that swaps the prop for one matching the industry. */
  surface: string
}

function buildContext(brandName: string, brandResult: BrandResult, input?: BrandInput): PromptContext {
  const palette = brandResult.styleBrief.colorPalette
  const industry = input?.industry ?? brandResult.industry ?? ''
  return {
    brandName,
    primary: hexToColorName(palette[0] ?? '#18181b'),
    secondary: hexToColorName(palette[1] ?? '#ffffff'),
    accent: hexToColorName(palette[2] ?? '#3b82f6'),
    style: brandResult.styleBrief.recommendedStyle,
    typography: brandResult.styleBrief.typography[0] ?? 'modern sans-serif',
    industry,
    anchor: industryAnchor(industry),
    surface: industryMockupSurface(industry),
  }
}

// Each prompt opens with the category anchor so Recraft locks the industry
// before it reads the rest of the scene. The default surface (concrete desk,
// wooden table, neutral background) gets swapped for an industry-appropriate
// surface when one exists — e.g. SaaS brands stop landing on warm bakery
// wooden tables, food brands stop landing on cold concrete. The previous
// `social-post` prompt hardcoded "Minimal editorial composition" which made
// every brand's Instagram mockup read as editorial regardless of industry.
const MOCKUP_PROMPTS: Record<MockupId, (c: PromptContext) => string> = {
  'business-card': (c) => `${c.anchor} Photorealistic business card lying flat on ${c.surface || 'a textured concrete desk'}. The card is ${c.primary} with the brand name "${c.brandName}" printed in ${c.typography}. Soft natural light from the side, subtle shadow, shallow depth of field. Clean professional product photography. No other text.`,
  'app-icon': (c) => `${c.anchor} iOS app icon on a dark home screen. Rounded-corner square icon with a ${c.primary} gradient background and the letter "${c.brandName[0] ?? 'A'}" in white ${c.typography} centered. Next to it three faint adjacent app icons. iPhone wallpaper blurred. Clean iOS 17 aesthetic.`,
  'social-post': (c) => `${c.anchor} Instagram post mockup for the brand "${c.brandName}". ${c.primary} and ${c.secondary} palette. Large brand name set in ${c.typography} centered on a clean background that fits ${c.industry || 'the brand'}. Professional social graphic, square format. No other text.`,
  'envelope-small': (c) => `${c.anchor} Photorealistic small ${c.secondary} envelope on ${c.surface || 'a light wooden desk'}. Brand name "${c.brandName}" printed in small ${c.typography} on the front. Soft studio lighting, top-down shot, minimal props.`,
  'envelope-large': (c) => `${c.anchor} Photorealistic large business envelope in ${c.secondary}. Brand name "${c.brandName}" printed in ${c.typography} at the top-left corner. Placed on ${c.surface || 'a textured surface'} with soft shadows. Product photography, clean composition.`,
  'letterhead': (c) => `${c.anchor} Photorealistic letterhead document on ${c.surface || 'a wooden desk'}. A crisp white page with the brand name "${c.brandName}" printed at the top in ${c.typography}, ${c.primary} color. Body of the page has placeholder lorem ipsum lines. Soft shadow, slightly top-down angle.`,
  'tshirt': (c) => `${c.anchor} Photorealistic folded ${c.secondary} t-shirt on a neutral background that fits ${c.industry || 'the brand'}. Brand name "${c.brandName}" printed on the chest area in ${c.typography}, ${c.primary} ink. Product photography, clean composition, soft shadow.`,
  'mug': (c) => `${c.anchor} Photorealistic ceramic mug on ${c.surface || 'a wooden desk'}. The mug is ${c.secondary} with the brand name "${c.brandName}" printed on the side in ${c.typography}, ${c.primary} color. Warm morning light, subtle steam rising, minimal background.`,
  'pen': (c) => `${c.anchor} Close-up photograph of a ${c.primary} pen lying on a notebook page. Brand name "${c.brandName}" engraved on the pen barrel in ${c.typography}. Soft natural light, shallow depth of field.`,
}

export function isMockupId(id: string): id is MockupId {
  return id in MOCKUP_PROMPTS
}

export async function generateRecraftMockup(
  templateId: string,
  brandName: string,
  brandResult: BrandResult,
  brandInput?: BrandInput,
): Promise<Buffer> {
  if (!isMockupId(templateId)) {
    throw new Error(`Unknown mockup template: ${templateId}`)
  }
  const ctx = buildContext(brandName, brandResult, brandInput)
  const prompt = MOCKUP_PROMPTS[templateId](ctx)
  return generateRecraftImage(prompt, {
    style: 'realistic_image',
    size: '1024x1024',
  })
}
