export interface BrandInput {
  companyName: string
  industry: string
  targetCustomer: string
  tones: string[]        // exactly 3 when submitted
  competitor: string     // optional, can be empty string
  existingName?: string  // if set, naming step is skipped — Claude generates only the brief
  customTone?: string    // free-text tone description — appended to picker tones in prompt
  moodImageDataUrl?: string  // 'data:image/jpeg;base64,...' — visual reference passed to Claude vision
}

export interface StyleBrief {
  recommendedStyle: string
  colorPalette: string[] // 3 hex values e.g. ['#0A0A0A', '#F5F5F0', '#C8A96E']
  typography: string[]   // 2 pairings e.g. ['Inter + Playfair Display']
  avoidList: string[]    // 3 items
  moodImages: string[]   // 3 public image paths
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
}
