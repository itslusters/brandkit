import 'server-only'
import { put } from '@vercel/blob'

// Upload a base64 data URL to Vercel Blob and return the public URL.
// Throws if the data URL is malformed or the upload fails.
export async function uploadDataUrl(dataUrl: string, pathname: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/)
  if (!match) throw new Error('invalid_data_url')
  const [, contentType, base64] = match
  const buffer = Buffer.from(base64, 'base64')
  const { url } = await put(pathname, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  })
  return url
}
