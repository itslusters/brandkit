import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

export type DownloadFile = { dataUrl: string; filename: string }

// iOS WKWebView ignores <a download> for both data: and blob: URLs, so on
// native we write the file to the cache directory and hand its URI to the
// iOS Share sheet (Photos / Files / AirDrop). Web keeps the anchor-click flow.
export async function saveDataUrls(files: DownloadFile[]): Promise<void> {
  if (files.length === 0) return

  if (Capacitor.isNativePlatform()) {
    const uris: string[] = []
    for (const f of files) {
      const base64 = f.dataUrl.includes(',') ? f.dataUrl.split(',')[1] : f.dataUrl
      const { uri } = await Filesystem.writeFile({
        path: f.filename,
        data: base64,
        directory: Directory.Cache,
      })
      uris.push(uri)
    }
    await Share.share({
      files: uris,
      dialogTitle: files.length > 1 ? 'Save logos' : 'Save logo',
    })
    return
  }

  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const a = document.createElement('a')
    a.href = f.dataUrl
    a.download = f.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    if (i < files.length - 1) await new Promise((r) => setTimeout(r, 150))
  }
}

/**
 * Save a Blob (e.g. PDF, ZIP, PNG fetched from an API) to the user's device.
 * Same platform split as saveDataUrls — native goes through Filesystem + Share,
 * web uses an object-URL anchor click.
 */
export async function saveBlob(blob: Blob, filename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob)
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    })
    await Share.share({ files: [uri], dialogTitle: `Save ${filename}` })
    return
  }

  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    URL.revokeObjectURL(url)
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
    reader.readAsDataURL(blob)
  })
}
