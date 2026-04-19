import 'server-only'
import { generateRecraftImage } from './recraft'
import { hexToColorName } from './colors'
import type { BrandResult } from './types'

/**
 * Recraft-driven mockup generation.
 *
 * For each template ID we ship a photorealistic scene prompt that includes
 * the brand name as text (Recraft V3's `realistic_image` style renders short
 * strings reasonably well) and optionally a palette color hint from the
 * style brief. The custom generated logo itself is NOT composed into the
 * mockup — the scene carries the brand *name* plus palette/aesthetic cues.
 * Users who need precise logo placement get the clean logo PNG download +
 * designer polish on paid tiers.
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
}

function buildContext(brandName: string, brandResult: BrandResult): PromptContext {
  const palette = brandResult.styleBrief.colorPalette
  return {
    brandName,
    primary: hexToColorName(palette[0] ?? '#18181b'),
    secondary: hexToColorName(palette[1] ?? '#ffffff'),
    accent: hexToColorName(palette[2] ?? '#3b82f6'),
    style: brandResult.styleBrief.recommendedStyle,
    typography: brandResult.styleBrief.typography[0] ?? 'modern sans-serif',
  }
}

const MOCKUP_PROMPTS: Record<MockupId, (c: PromptContext) => { prompt: string; size: string }> = {
  'business-card': (c) => ({
    prompt: `Photorealistic business card lying flat on a textured concrete desk. The card is ${c.primary} with the brand name "${c.brandName}" printed in ${c.typography}. Soft natural light from the side, subtle shadow, shallow depth of field. Clean professional product photography. No other text.`,
    size: '1365x1024',
  }),
  'app-icon': (c) => ({
    prompt: `iOS app icon on a dark home screen background. The app icon is a rounded-corner square with a ${c.primary} gradient background, and the letter "${c.brandName[0] ?? 'A'}" in white ${c.typography} centered inside. Next to it are three other faint app icons. iPhone wallpaper blurred. Clean iOS 17 aesthetic.`,
    size: '1024x1024',
  }),
  'social-post': (c) => ({
    prompt: `Instagram post mockup for the brand "${c.brandName}". Minimal editorial composition in a ${c.primary} and ${c.secondary} palette. Large brand name set in ${c.typography} centered on a clean background. The style is ${c.style}. Professional social graphic, 1:1 format.`,
    size: '1024x1024',
  }),
  'envelope-small': (c) => ({
    prompt: `Photorealistic small ${c.secondary} envelope on a light wooden desk. Brand name "${c.brandName}" printed in small ${c.typography} on the front. Soft studio lighting, top-down shot, minimal props.`,
    size: '1365x1024',
  }),
  'envelope-large': (c) => ({
    prompt: `Photorealistic large business envelope in ${c.secondary}. Brand name "${c.brandName}" printed in ${c.typography} at the top-left corner. Placed on a textured surface with soft shadows. Product photography, clean composition.`,
    size: '1365x1024',
  }),
  'letterhead': (c) => ({
    prompt: `Photorealistic letterhead document on a desk. A crisp white page with the brand name "${c.brandName}" printed at the top in ${c.typography}, ${c.primary} color. Body of the page has placeholder lorem ipsum text. Soft shadow, overhead shot.`,
    size: '1024x1365',
  }),
  'tshirt': (c) => ({
    prompt: `Photorealistic folded ${c.secondary} t-shirt on a neutral background. Brand name "${c.brandName}" printed on the chest area in ${c.typography}, ${c.primary} ink. Product photography, clean composition, soft shadow.`,
    size: '1024x1024',
  }),
  'mug': (c) => ({
    prompt: `Photorealistic ceramic mug on a wooden desk. The mug is ${c.secondary} with the brand name "${c.brandName}" printed on the side in ${c.typography}, ${c.primary} color. Warm morning light, subtle steam rising, minimal background.`,
    size: '1365x1024',
  }),
  'pen': (c) => ({
    prompt: `Close-up photograph of a ${c.primary} pen lying on a notebook page. Brand name "${c.brandName}" engraved on the pen barrel in ${c.typography}. Soft natural light, shallow depth of field.`,
    size: '1365x1024',
  }),
}

export function isMockupId(id: string): id is MockupId {
  return id in MOCKUP_PROMPTS
}

/**
 * Render a mockup via Recraft. Returns a PNG buffer. Throws on Recraft
 * API failure — caller should handle per-template error state.
 */
export async function generateRecraftMockup(
  templateId: string,
  brandName: string,
  brandResult: BrandResult,
): Promise<Buffer> {
  if (!isMockupId(templateId)) {
    throw new Error(`Unknown mockup template: ${templateId}`)
  }
  const ctx = buildContext(brandName, brandResult)
  const { prompt, size } = MOCKUP_PROMPTS[templateId](ctx)
  return generateRecraftImage(prompt, {
    style: 'realistic_image',
    size,
  })
}
