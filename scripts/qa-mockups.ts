/**
 * Mockup QA — generates every template for a set of test brands and writes
 * a markdown report with success rate per template. Use to decide which
 * prompts need tuning before expanding the mockup roster.
 *
 *   npx tsx scripts/qa-mockups.ts
 *
 * Requires GEMINI_API_KEY. Costs roughly (fixtures × 9 templates × $0.04).
 * Default fixture set = 3 brands = $1.08 per run. Override via --brands=N
 * when you want a wider sample.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { generateMockup } from '../lib/mockups-imagen'
import type { BrandResult } from '../lib/types'

interface Fixture {
  label: string
  brandName: string
  brandResult: BrandResult
}

const FIXTURES: Fixture[] = [
  {
    label: 'Tech SaaS — short name',
    brandName: 'Nexio',
    brandResult: {
      industry: 'SaaS B2B',
      namingCandidates: [],
      styleBrief: {
        recommendedStyle: 'Geometric Minimal — crisp grid, bold sans-serif, clear hierarchy',
        colorPalette: ['#0f172a', '#f8fafc', '#3b82f6'],
        typography: ['Inter', 'JetBrains Mono'],
        avoidList: ['rainbow gradients', 'chromatic aberration', 'generic tech swoosh'],
        recommendedMockups: ['business-card', 'app-icon', 'social-post'],
      },
    },
  },
  {
    label: 'Organic artisan — warm palette',
    brandName: 'Hearthside',
    brandResult: {
      industry: 'Food & Beverage',
      namingCandidates: [],
      styleBrief: {
        recommendedStyle: 'Organic Artisan — hand-lettered serif, earthy palette, tactile feel',
        colorPalette: ['#6b4226', '#f5e6d3', '#b08968'],
        typography: ['DM Serif Display', 'Instrument Serif'],
        avoidList: ['neon', 'glossy 3D', 'stock logo clip art'],
        recommendedMockups: ['envelope-large', 'letterhead', 'mug'],
      },
    },
  },
  {
    label: 'Bold streetwear — heavy type',
    brandName: 'OFFGRID',
    brandResult: {
      industry: 'Fashion & Apparel',
      namingCandidates: [],
      styleBrief: {
        recommendedStyle: 'Bold Statement — extra-heavy weight, high contrast B&W, brutalist',
        colorPalette: ['#000000', '#ffffff', '#dc2626'],
        typography: ['Archivo Black', 'IBM Plex Mono'],
        avoidList: ['pastel', 'cursive script', 'rounded friendly'],
        recommendedMockups: ['tshirt', 'social-post', 'pen'],
      },
    },
  },
]

const ALL_TEMPLATES = [
  'business-card', 'app-icon', 'social-post', 'envelope-small',
  'envelope-large', 'letterhead', 'tshirt', 'mug', 'pen',
] as const

interface Outcome {
  fixture: string
  template: string
  status: 'ok' | 'fail'
  bytes?: number
  error?: string
  elapsedMs: number
}

async function runOne(fixture: Fixture, template: string): Promise<Outcome> {
  const start = Date.now()
  try {
    const buf = await generateMockup(template, fixture.brandName, fixture.brandResult)
    return {
      fixture: fixture.label,
      template,
      status: 'ok',
      bytes: buf.length,
      elapsedMs: Date.now() - start,
    }
  } catch (err) {
    return {
      fixture: fixture.label,
      template,
      status: 'fail',
      error: err instanceof Error ? err.message : String(err),
      elapsedMs: Date.now() - start,
    }
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not set')
    process.exit(1)
  }

  const outcomes: Outcome[] = []
  // Serialize per fixture (Recraft has a modest rate limit per account).
  // Parallelize the 9 templates within a single fixture.
  for (const fixture of FIXTURES) {
    console.log(`\n▶ ${fixture.label} (${fixture.brandName})`)
    const results = await Promise.all(ALL_TEMPLATES.map((t) => runOne(fixture, t)))
    for (const r of results) {
      const tag = r.status === 'ok' ? '✓' : '✗'
      console.log(`  ${tag} ${r.template.padEnd(16)} ${r.elapsedMs}ms  ${r.error ?? ''}`)
      outcomes.push(r)
    }
  }

  // Aggregate stats
  const byTemplate = new Map<string, { ok: number; fail: number; avgMs: number }>()
  for (const o of outcomes) {
    const entry = byTemplate.get(o.template) ?? { ok: 0, fail: 0, avgMs: 0 }
    entry[o.status] = entry[o.status] + 1
    entry.avgMs += o.elapsedMs
    byTemplate.set(o.template, entry)
  }

  const total = outcomes.length
  const okCount = outcomes.filter((o) => o.status === 'ok').length
  const overallSuccess = Math.round((okCount / total) * 100)

  const lines: string[] = []
  lines.push(`# Mockup QA Report — ${new Date().toISOString()}`)
  lines.push('')
  lines.push(`**Overall success rate: ${overallSuccess}%** (${okCount}/${total})`)
  lines.push(`**Fixtures**: ${FIXTURES.length} · **Templates**: ${ALL_TEMPLATES.length}`)
  lines.push('')
  lines.push('## Per-template')
  lines.push('| Template | OK | Fail | Avg ms |')
  lines.push('|----------|----|------|--------|')
  byTemplate.forEach((stats, template) => {
    const n = stats.ok + stats.fail
    const rate = Math.round((stats.ok / n) * 100)
    lines.push(`| ${template} | ${stats.ok} (${rate}%) | ${stats.fail} | ${Math.round(stats.avgMs / n)} |`)
  })
  lines.push('')
  lines.push('## Failures')
  const fails = outcomes.filter((o) => o.status === 'fail')
  if (fails.length === 0) {
    lines.push('_none_')
  } else {
    for (const f of fails) {
      lines.push(`- **${f.fixture} · ${f.template}** — ${f.error}`)
    }
  }

  const outDir = path.join(process.cwd(), 'docs', 'qa')
  await mkdir(outDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = path.join(outDir, `mockups-${stamp}.md`)
  await writeFile(outPath, lines.join('\n'), 'utf-8')
  console.log(`\nWrote ${outPath}`)
  console.log(`Overall: ${overallSuccess}% success`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
