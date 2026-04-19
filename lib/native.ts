/**
 * Native bridge — calls Capacitor plugins when running inside the iOS shell,
 * falls back to Web APIs (or no-ops) in browsers. All helpers are safe to
 * invoke from any client component; the browser build stays 100% functional.
 *
 * Why feature-detect at runtime instead of separate builds: we ship one
 * codebase, the web build is the master, and the iOS shell loads it via
 * Capacitor `server.url`. `window.Capacitor` only exists inside the native
 * container, so detection is trivial.
 */

type CapacitorWindow = Window & {
  Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string }
}

export function isNative(): boolean {
  if (typeof window === 'undefined') return false
  const cap = (window as CapacitorWindow).Capacitor
  return !!cap?.isNativePlatform?.()
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web'
  const p = (window as CapacitorWindow).Capacitor?.getPlatform?.() ?? 'web'
  return (p === 'ios' || p === 'android' ? p : 'web')
}

/* ------------------------------- HAPTICS -------------------------------- */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'

export async function haptic(style: HapticStyle = 'light'): Promise<void> {
  if (!isNative()) {
    // Best-effort web vibration — most desktops ignore, mobile browsers may honor.
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const ms = style === 'heavy' ? 40 : style === 'medium' ? 20 : 10
      try { navigator.vibrate?.(ms) } catch { /* ignore */ }
    }
    return
  }
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')
    if (style === 'selection') { await Haptics.selectionStart(); await Haptics.selectionEnd(); return }
    if (style === 'success' || style === 'warning' || style === 'error') {
      const map = { success: NotificationType.Success, warning: NotificationType.Warning, error: NotificationType.Error }
      await Haptics.notification({ type: map[style] })
      return
    }
    const impact = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy }[style]
    await Haptics.impact({ style: impact })
  } catch {
    /* silent — haptics are a nice-to-have */
  }
}

/* -------------------------------- SHARE --------------------------------- */

export interface ShareOptions {
  title?: string
  text?: string
  url?: string
  dialogTitle?: string
}

/**
 * Opens the iOS share sheet when on device, falls back to Web Share API,
 * then to a clipboard-copy of the URL for desktop. Returns true on success.
 */
export async function share(options: ShareOptions): Promise<boolean> {
  if (isNative()) {
    try {
      const { Share } = await import('@capacitor/share')
      await Share.share(options)
      return true
    } catch {
      return false
    }
  }
  if (typeof navigator !== 'undefined') {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: options.title, text: options.text, url: options.url })
        return true
      } catch {
        return false
      }
    }
    if (options.url && nav.clipboard) {
      try {
        await nav.clipboard.writeText(options.url)
        return true
      } catch {
        return false
      }
    }
  }
  return false
}

/* ----------------------------- FILE SAVE -------------------------------- */

/**
 * On iOS: saves a blob to the Documents directory visible in the Files app.
 * On web: triggers a normal browser download via an anchor element.
 * Input expects a base64 string (no data URL prefix) for native; blob for web.
 */
export async function saveFile(
  filename: string,
  data: { blob?: Blob; base64?: string; mimeType?: string },
): Promise<boolean> {
  if (isNative() && data.base64) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem')
      await Filesystem.writeFile({
        path: filename,
        data: data.base64,
        directory: Directory.Documents,
      })
      return true
    } catch (err) {
      console.error('[native] saveFile failed:', err)
      return false
    }
  }
  if (data.blob && typeof document !== 'undefined') {
    const url = URL.createObjectURL(data.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return true
  }
  return false
}
