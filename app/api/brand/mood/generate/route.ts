import { logoLimiter, getIp } from '@/lib/ratelimit'
import { MOOD_TEMPLATES, MOOD_FREE_COUNT, buildMoodPrompt, getMoodById } from '@/lib/mood-templates'
import { generateMoodImage } from '@/lib/recraft'
import { getUserTier } from '@/lib/tier'
import type { BrandInput, BrandResult } from '@/lib/types'

interface RequestBody {
  brandInput: BrandInput
  brandResult: BrandResult
  templateIds?: string[]
}

function sse(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    const ip = getIp(req)
    const { success } = await logoLimiter.limit(ip)
    if (!success) {
      return new Response(
        JSON.stringify({ type: 'error', message: 'Daily limit reached. Please try again tomorrow.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  const { brandInput, brandResult, templateIds }: RequestBody = await req.json()

  const tier = await getUserTier()
  const isFree = tier === 'free'

  const requestedIds = templateIds && templateIds.length > 0
    ? templateIds.filter((id) => getMoodById(id))
    : MOOD_TEMPLATES.map((t) => t.id)

  const effectiveIds = isFree ? requestedIds.slice(0, MOOD_FREE_COUNT) : requestedIds

  const body = new ReadableStream({
    async start(controller) {
      const lockedIds = isFree ? requestedIds.slice(MOOD_FREE_COUNT) : []
      controller.enqueue(sse({ type: 'plan', generating: effectiveIds, locked: lockedIds, tier }))

      const tasks = effectiveIds.map(async (id, i) => {
        try {
          const tpl = getMoodById(id)
          if (!tpl) throw new Error(`Unknown mood template: ${id}`)
          const prompt = buildMoodPrompt(brandInput, brandResult, tpl)
          const raw = await generateMoodImage(prompt, { size: tpl.size, variationIndex: i })
          const dataUrl = `data:image/png;base64,${raw.toString('base64')}`
          controller.enqueue(sse({ type: 'image_ready', index: i, templateId: id, dataUrl }))
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Mood image generation failed'
          console.error(`[mood] generation failed for template=${id}:`, err)
          controller.enqueue(sse({ type: 'image_error', index: i, templateId: id, message }))
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
