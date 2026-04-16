import { genai, buildLogoPrompt } from '@/lib/gemini'
import { logoLimiter, getIp } from '@/lib/ratelimit'
import type { BrandInput, BrandResult, LogoType } from '@/lib/types'

interface RequestBody {
  brandInput: BrandInput
  brandResult: BrandResult
  selectedName: string
  logoType: LogoType
}

function sse(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function POST(req: Request) {
  const ip = getIp(req)
  const { success } = await logoLimiter.limit(ip)
  if (!success) {
    return new Response(
      JSON.stringify({ type: 'error', message: 'Daily limit reached. Please try again tomorrow.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { brandInput, brandResult, selectedName, logoType }: RequestBody = await req.json()

  const body = new ReadableStream({
    async start(controller) {
      const tasks = [0, 1, 2].map(async (i) => {
        try {
          const prompt = buildLogoPrompt(brandInput, brandResult, selectedName, logoType, i)
          const response = await genai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/png' },
          })
          const base64 = response.generatedImages?.[0]?.image?.imageBytes ?? ''
          controller.enqueue(sse({ type: 'image_ready', index: i, dataUrl: `data:image/png;base64,${base64}` }))
        } catch (err) {
          controller.enqueue(sse({
            type: 'image_error',
            index: i,
            message: err instanceof Error ? err.message : 'Image generation failed',
          }))
        }
      })

      await Promise.allSettled(tasks)
      controller.enqueue(sse({ type: 'done' }))
      controller.close()
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
