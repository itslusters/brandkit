import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

export type DownloadFile = { dataUrl: string; filename: string }

// iOS WKWebView ignores <a download> for data: URLs, so on native we write the
// PNG to the cache directory and hand the file URIs to the iOS Share sheet
// (Photos / Files / AirDrop). Web keeps the anchor-click flow.
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
