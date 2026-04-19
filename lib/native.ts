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

/* -------------------------------- CAMERA -------------------------------- */

export type PhotoSource = 'camera' | 'photos' | 'prompt'

export interface TakePhotoResult {
  /** data URL form, i.e. `data:image/jpeg;base64,...` — consistent with other image helpers in the app */
  dataUrl: string
  format: 'jpeg' | 'png' | 'webp'
}

/**
 * Captures a photo from camera (or library) on iOS, falls back to a standard
 * `<input type="file" accept="image/*" capture>` on web. This is the native
 * capability that differentiates the iOS build from a plain web wrapper — it
 * gives users a one-tap way to snap inspiration for the brand reference.
 *
 * Returns null if the user cancels or the capture fails.
 */
export async function takePhoto(source: PhotoSource = 'prompt'): Promise<TakePhotoResult | null> {
  if (isNative()) {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
      const sourceMap = {
        camera: CameraSource.Camera,
        photos: CameraSource.Photos,
        prompt: CameraSource.Prompt,
      }
      const photo = await Camera.getPhoto({
        quality: 75,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: sourceMap[source],
        correctOrientation: true,
        // Cap dimensions so sessionStorage (~5MB) and API payloads stay small.
        width: 1600,
        height: 1600,
      })
      if (!photo.dataUrl) return null
      const format = (photo.format === 'png' || photo.format === 'webp' ? photo.format : 'jpeg') as 'jpeg' | 'png' | 'webp'
      return { dataUrl: photo.dataUrl, format }
    } catch {
      return null
    }
  }
  // Web fallback: transient <input type="file"> click.
  if (typeof document === 'undefined') return null
  return new Promise<TakePhotoResult | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    if (source === 'camera') input.setAttribute('capture', 'environment')
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      try {
        const dataUrl = await downscaleToDataUrl(file, 1600, 0.75)
        resolve(dataUrl ? { dataUrl, format: 'jpeg' } : null)
      } catch {
        resolve(null)
      }
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}

async function downscaleToDataUrl(file: File, maxEdge: number, quality: number): Promise<string | null> {
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return null
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(bitmap, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
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
