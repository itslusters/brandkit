export function setSession(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function getSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : null
}

// Clear all brand-flow keys when starting a new brand
const BRAND_KEYS = [
  'brandInput', 'brandResult', 'selectedName', 'selectedLogoDataUrl',
  'logoType', 'emailCaptured', 'mockupResults', 'selectedMockupIds',
]

export function clearBrandSession(): void {
  if (typeof window === 'undefined') return
  for (const key of BRAND_KEYS) sessionStorage.removeItem(key)
}
