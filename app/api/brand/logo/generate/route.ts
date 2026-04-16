import { genai, buildLogoPrompt } from '@/lib/gemini'
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
  const { brandInput, brandResult, selectedName, logoType }: RequestBody = await req.json()

  const body = new ReadableStream({
    async start(controller) {
      try {
        const promises = [0, 1, 2].map(async (i) => {
          const prompt = buildLogoPrompt(brandInput, brandResult, selectedName, logoType, i)
          const response = await genai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/png' },
          })
          const base64 = response.generatedImages?.[0]?.image?.imageBytes ?? ''
          const dataUrl = `data:image/png;base64,${base64}`
          controller.enqueue(sse({ type: 'image_ready', index: i, dataUrl }))
        })

        await Promise.all(promises)
        controller.enqueue(sse({ type: 'done' }))
      } catch (err) {
        controller.enqueue(sse({
          type: 'error',
          message: err instanceof Error ? err.message : 'Image generation failed',
        }))
      } finally {
        controller.close()
      }
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
