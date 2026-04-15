export interface BrandInput {
  companyName: string
  industry: string
  targetCustomer: string
  tones: string[]        // exactly 3 when submitted
  competitor: string     // optional, can be empty string
}

export interface StyleBrief {
  recommendedStyle: string
  colorPalette: string[] // 3 hex values e.g. ['#0A0A0A', '#F5F5F0', '#C8A96E']
  typography: string[]   // 2 pairings e.g. ['Inter + Playfair Display']
  avoidList: string[]    // 3 items
  moodImages: string[]   // 3 public image paths
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
