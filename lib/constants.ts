import type { StreamTask } from './types'

export const TONE_KEYWORDS = [
  'Bold', 'Minimal', 'Playful', 'Premium',
  'Trusted', 'Innovative', 'Warm', 'Technical',
  'Energetic', 'Calm', 'Elegant', 'Raw',
] as const

export const INDUSTRIES = [
  'SaaS / Software',
  'E-commerce / Retail',
  'Food & Beverage',
  'Fashion & Apparel',
  'Health & Wellness',
  'Finance & Fintech',
  'Education',
  'Real Estate',
  'Travel & Hospitality',
  'Media & Entertainment',
  'Agency / Consulting',
  'Other',
] as const

export const INITIAL_STREAM_TASKS: StreamTask[] = [
  { id: 'industry', label: 'Analyzing your industry...', status: 'pending', content: '' },
  { id: 'naming',   label: 'Generating name ideas...',  status: 'pending', content: '' },
  { id: 'brief',    label: 'Defining brand direction...', status: 'pending', content: '' },
]
