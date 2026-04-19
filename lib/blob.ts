import 'server-only'
import { put } from '@vercel/blob'

/**
 * Upload a base64 data URL to Vercel Blob and return the public URL.
 *
 * IMPORTANT: the target Blob store MUST be configured as **public** in the
 * Vercel dashboard (Storage → your store → Settings → Access: Public).
 * Logos and mockups are served directly by the browser on share pages and
 * by the mobile app — signed-URL reads would add friction and break the
 * copy-link share flow. If you see
 *   `Vercel Blob: Cannot use public access on a private store.`
 * the store was created as private. Fix: either flip the store to public,
 * or create a new public store and re-point `BLOB_READ_WRITE_TOKEN`.
 */
export async function uploadDataUrl(dataUrl: string, pathname: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/)
  if (!match) throw new Error('invalid_data_url')
  const [, contentType, base64] = match
  const buffer = Buffer.from(base64, 'base64')
  try {
    const { url } = await put(pathname, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    })
    return url
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/private store/i.test(msg) || /private access/i.test(msg)) {
      throw new Error(
        'blob_store_private: The configured Vercel Blob store rejects public uploads. ' +
        'Open the Vercel dashboard → Storage → Settings and switch the store to Public, ' +
        'or point BLOB_READ_WRITE_TOKEN at a public store.',
      )
    }
    throw err
  }
}
