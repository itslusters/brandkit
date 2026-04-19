/**
 * Logo QA — generates all three logo types (wordmark / symbol+text / emblem)
 * × three iteration variations for each fixture brand and writes a markdown
 * report with success rates + sample data-URLs. Lets us eyeball whether
 * prompt-driven Recraft is producing structurally distinct outputs per type.
 *
 *   npx tsx scripts/qa-logos.ts
 *
 * Requires RECRAFT_API_KEY. Cost: fixtures × 3 types × 3 variations × $0.04.
 * Default = 3 fixtures = $1.08 per run. Generated PNGs land under
 * docs/qa/logos-{timestamp}/ so you can scroll through them.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { buildLogoPrompt } from '../lib/gemini'
import { generateRecraftImage } from '../lib/recraft'
import { postprocessLogo } from '../lib/logo-postprocess'
import type { BrandInput, BrandResult, LogoType } from '../lib/types'

interface Fixture {
  label: string
  brandName: string
  brandInput: BrandInput
  brandResult: BrandResult
}

const FIXTURES: Fixture[] = [
  {
    label: 'Tech SaaS',
    brandName: 'Nexio',
    brandInput: {
      companyName: 'Nexio',
      industry: 'SaaS / Software',
      targetCustomer: 'Startup founders',
      tones: ['modern', 'minimal', 'clean'],
      competitor: 'Linear',
      stylePack: 'geometric',
    },
    brandResult: {
      industry: 'SaaS B2B',
      namingCandidates: [],
      styleBrief: {
        recommendedStyle: 'Geometric Minimal — crisp grid, bold sans-serif',
        colorPalette: ['#0f172a', '#f8fafc', '#3b82f6'],
        typography: ['Inter', 'JetBrains Mono'],
        avoidList: ['rainbow gradients', 'chromatic aberration', 'generic tech swoosh'],
        recommendedMockups: ['business-card', 'app-icon', 'social-post'],
      },
    },
  },
  {
    label: 'Organic F&B',
    brandName: 'Hearthside',
    brandInput: {
      companyName: 'Hearthside',
      industry: 'Food & Beverage',
      targetCustomer: 'Home-cook enthusiasts',
      tones: ['warm', 'organic', 'artisan'],
      competitor: 'Aesop',
      stylePack: 'organic',
    },
    brandResult: {
      industry: 'Food & Beverage',
      namingCandidates: [],
      styleBrief: {
        recommendedStyle: 'Organic Artisan — hand-lettered serif, earthy palette',
        colorPalette: ['#6b4226', '#f5e6d3', '#b08968'],
        typography: ['DM Serif Display', 'Instrument Serif'],
        avoidList: ['neon', 'glossy 3D', 'stock logo clip art'],
        recommendedMockups: ['envelope-large', 'letterhead', 'mug'],
      },
    },
  },
  {
    label: 'Bold Streetwear',
    brandName: 'OFFGRID',
    brandInput: {
      companyName: 'OFFGRID',
      industry: 'Fashion & Apparel',
      targetCustomer: 'Gen-Z streetwear buyers',
      tones: ['bold', 'confident', 'strong'],
      competitor: 'Off-White',
      stylePack: 'bold',
    },
    brandResult: {
      industry: 'Fashion & Apparel',
      namingCandidates: [],
      styleBrief: {
        recommendedStyle: 'Bold Statement — extra-heavy weight, brutalist B&W',
        colorPalette: ['#000000', '#ffffff', '#dc2626'],
        typography: ['Archivo Black', 'IBM Plex Mono'],
        avoidList: ['pastel', 'cursive script', 'rounded friendly'],
        recommendedMockups: ['tshirt', 'social-post', 'pen'],
      },
    },
  },
]

const LOGO_TYPES: LogoType[] = ['wordmark', 'symbol-text', 'emblem']

interface Outcome {
  fixture: string
  type: LogoType
  variation: number
  status: 'ok' | 'fail'
  bytes?: number
  error?: string
  elapsedMs: number
  filename?: string
}

async function runOne(fixture: Fixture, type: LogoType, variation: number, outDir: string): Promise<Outcome> {
  const start = Date.now()
  try {
    const prompt = buildLogoPrompt(
      fixture.brandInput,
      fixture.brandResult,
      fixture.brandName,
      type,
      variation,
    )
    const raw = await generateRecraftImage(prompt, {
      style: 'vector_illustration',
      variationIndex: variation,
    })
    const processed = await postprocessLogo(raw)
    const filename = `${fixture.label.replace(/\s+/g, '-')}_${type}_v${variation}.png`
    await writeFile(path.join(outDir, filename), new Uint8Array(processed))
    return {
      fixture: fixture.label,
      type,
      variation,
      status: 'ok',
      bytes: processed.length,
      elapsedMs: Date.now() - start,
      filename,
    }
  } catch (err) {
    return {
      fixture: fixture.label,
      type,
      variation,
      status: 'fail',
      error: err instanceof Error ? err.message : String(err),
      elapsedMs: Date.now() - start,
    }
  }
}

async function main() {
  if (!process.env.RECRAFT_API_KEY) {
    console.error('RECRAFT_API_KEY not set')
    process.exit(1)
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outDir = path.join(process.cwd(), 'docs', 'qa', `logos-${stamp}`)
  await mkdir(outDir, { recursive: true })

  const outcomes: Outcome[] = []
  for (const fixture of FIXTURES) {
    console.log(`\n▶ ${fixture.label} (${fixture.brandName})`)
    for (const type of LOGO_TYPES) {
      const batch = await Promise.all([0, 1, 2].map((v) => runOne(fixture, type, v, outDir)))
      for (const r of batch) {
        const tag = r.status === 'ok' ? '✓' : '✗'
        console.log(`  ${tag} ${type.padEnd(12)} v${r.variation}  ${r.elapsedMs}ms  ${r.error ?? ''}`)
        outcomes.push(r)
      }
    }
  }

  // Aggregate
  const byType = new Map<LogoType, { ok: number; fail: number; avgMs: number }>()
  for (const o of outcomes) {
    const entry = byType.get(o.type) ?? { ok: 0, fail: 0, avgMs: 0 }
    entry[o.status] = entry[o.status] + 1
    entry.avgMs += o.elapsedMs
    byType.set(o.type, entry)
  }

  const total = outcomes.length
  const okCount = outcomes.filter((o) => o.status === 'ok').length
  const overallSuccess = Math.round((okCount / total) * 100)

  const lines: string[] = []
  lines.push(`# Logo QA Report — ${new Date().toISOString()}`)
  lines.push('')
  lines.push(`**Overall success rate: ${overallSuccess}%** (${okCount}/${total})`)
  lines.push(`**Fixtures**: ${FIXTURES.length} · **Types**: ${LOGO_TYPES.length} · **Variations**: 3 each`)
  lines.push(`**PNGs written to**: \`${path.relative(process.cwd(), outDir)}/\``)
  lines.push('')
  lines.push('## Per-type')
  lines.push('| Type | OK | Fail | Avg ms |')
  lines.push('|------|----|------|--------|')
  byType.forEach((stats, type) => {
    const n = stats.ok + stats.fail
    const rate = Math.round((stats.ok / n) * 100)
    lines.push(`| ${type} | ${stats.ok} (${rate}%) | ${stats.fail} | ${Math.round(stats.avgMs / n)} |`)
  })
  lines.push('')
  lines.push('## Per-fixture')
  for (const fixture of FIXTURES) {
    const rows = outcomes.filter((o) => o.fixture === fixture.label)
    const ok = rows.filter((o) => o.status === 'ok').length
    lines.push(`- **${fixture.label}**: ${ok}/${rows.length} ok`)
    for (const r of rows) {
      const tag = r.status === 'ok' ? '✓' : '✗'
      const file = r.filename ? ` → \`${r.filename}\`` : ''
      const err = r.error ? ` — ${r.error}` : ''
      lines.push(`  - ${tag} ${r.type} v${r.variation}${file}${err}`)
    }
  }
  lines.push('')
  lines.push('## Visual check')
  lines.push('Open the PNG directory and scan per-type columns. Expected:')
  lines.push('- **wordmark**: pure typography, no icons/borders')
  lines.push('- **symbol-text**: icon + brand name, clearly separated')
  lines.push('- **emblem**: brand name enclosed in shield/circle/badge')
  lines.push('If three types look visually similar within a fixture, the prompt contract in `lib/gemini.ts` LOGO_TYPE_DESCRIPTIONS needs strengthening.')

  const reportPath = path.join(outDir, 'report.md')
  await writeFile(reportPath, lines.join('\n'), 'utf-8')
  console.log(`\nWrote ${reportPath}`)
  console.log(`Overall: ${overallSuccess}% success`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
