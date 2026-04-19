export interface BrandInput {
  companyName: string
  industry: string
  targetCustomer: string
  tones: string[]        // exactly 3 when submitted
  competitor: string     // optional, can be empty string
  existingName?: string  // if set, naming step is skipped — Claude generates only the brief
  customTone?: string    // free-text tone description — appended to picker tones in prompt
  stylePack?: string     // style pack ID — injects aesthetic directive into prompts
  referencePhotoDataUrl?: string  // optional inspiration photo (base64 data URL) — uploaded on save, not used for generation
}

export interface StyleBrief {
  recommendedStyle: string
  colorPalette: string[] // 3 hex values e.g. ['#0A0A0A', '#F5F5F0', '#C8A96E']
  typography: string[]   // 2 pairings e.g. ['Inter + Playfair Display']
  avoidList: string[]    // 3 items
  recommendedMockups: string[]
}

export interface NamingCandidate {
  name: string
  rationale: string      // 1 sentence
}

export type StreamTaskStatus = 'pending' | 'active' | 'done'

export interface StreamTask {
  id: string
  label: string
  status: StreamTaskStatus
  content: string        // streamed text, empty when pending
}

export interface BrandResult {
  industry: string
  namingCandidates: NamingCandidate[]
  styleBrief: StyleBrief
}

export type LogoType = 'wordmark' | 'symbol-text' | 'emblem'

export type IterationModifier = 'bolder' | 'minimal' | 'geometric' | 'organic' | 'playful'

export type MockupCategory = 'print' | 'digital' | 'social' | 'merch'

export interface MockupTemplate {
  id: string
  name: string
  category: MockupCategory
  image: string
  logoZone: { x: number; y: number; width: number; height: number }
  aspectRatio: string
}

export interface MockupResult {
  templateId: string
  dataUrl: string
  /** Persistent Vercel Blob URL — present when the mockup was uploaded
   *  during generation. Used by the save flow to avoid re-sending the
   *  base64 payload, and by guide/ZIP downloads to skip regeneration. */
  url?: string
  error?: string
}
