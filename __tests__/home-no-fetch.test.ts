// @vitest-environment node
import { it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

it('the / landing does not import the brands data layer (no blocking fetch → no black screen)', () => {
  const src = readFileSync(path.resolve(process.cwd(), 'app/page.tsx'), 'utf8')
  expect(src).not.toContain('@/lib/brands')
  expect(src).not.toContain('listPublicBrands')
})
