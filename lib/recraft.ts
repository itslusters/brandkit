import 'server-only'

const RECRAFT_API_URL = 'https://external.api.recraft.ai/v1/images/generations'

export type RecraftStyle = 'vector_illustration' | 'digital_illustration' | 'realistic_image' | 'icon'
export type RecraftModel = 'recraftv2' | 'recraftv3'

interface RecraftOptions {
  style?: RecraftStyle
  substyle?: string
  size?: string
  model?: RecraftModel
}

interface RecraftResponse {
  data?: Array<{ b64_json?: string }>
  error?: { message?: string }
}

export async function generateRecraftImage(
  prompt: string,
  options: RecraftOptions = {},
): Promise<Buffer> {
  const apiKey = process.env.RECRAFT_API_KEY
  if (!apiKey) throw new Error('RECRAFT_API_KEY not configured')

  const res = await fetch(RECRAFT_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      model: options.model ?? 'recraftv3',
      style: options.style ?? 'vector_illustration',
      ...(options.substyle ? { substyle: options.substyle } : {}),
      size: options.size ?? '1024x1024',
      n: 1,
      response_format: 'b64_json',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Recraft API ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = (await res.json()) as RecraftResponse
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new Error(data.error?.message ?? 'Recraft returned no image')
  return Buffer.from(b64, 'base64')
}
