'use client'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { SavedBrand } from '@/lib/brands'

interface Props {
  brand: SavedBrand
  /** What the eyebrow above the name says — "Saved brand", "Shared brand", etc. */
  eyebrow: string
  /** Optional badge rendered top-right (e.g. "Made with Kiln" on the share page). */
  ribbon?: ReactNode
  /** Action bar rendered after the artifact block (downloads, share toggle, remix…). */
  actions: ReactNode
}

/**
 * Editorial layout for a saved or shared brand. This is the "magazine
 * spread" moment — the brand is being revealed, not just displayed. Both
 * the owner's library view and the public share page render through this
 * shell so the experience is consistent, and any polish applied here lifts
 * both surfaces at once.
 */
export function BrandArtifact({ brand, eyebrow, ribbon, actions }: Props) {
  const palette = brand.brandResult.styleBrief.colorPalette.slice(0, 5)
  const typography = brand.brandResult.styleBrief.typography
  const avoid = brand.brandResult.styleBrief.avoidList
  const style = brand.brandResult.styleBrief.recommendedStyle

  return (
    <div className="pt-2 pb-16">
      {/* Masthead: eyebrow + display name + optional ribbon */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex items-start justify-between gap-4"
      >
        <div>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h1 className="display-1 text-white">{brand.name}</h1>
          <p className="mt-3 text-sm text-zinc-500 max-w-lg leading-relaxed">{style}</p>
        </div>
        {ribbon && <div className="shrink-0 pt-2">{ribbon}</div>}
      </motion.header>

      {/* Logo hero — the centerpiece. White plate, generous padding. */}
      <motion.figure
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl bg-white p-12 md:p-16 mb-4 flex items-center justify-center shadow-2xl shadow-black/30"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.selectedLogoUrl} alt={brand.name} className="max-h-40 md:max-h-48 object-contain" />
      </motion.figure>

      {/* Palette band — one wide strip of the brand's colors, hex overlaid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="rounded-2xl overflow-hidden flex h-20 md:h-24 mb-10 border border-zinc-800/60"
      >
        {palette.map((hex, i) => {
          const textColor = isDark(hex) ? 'text-white/85' : 'text-black/75'
          return (
            <div
              key={`${hex}-${i}`}
              style={{ backgroundColor: hex }}
              className={`flex-1 flex items-end justify-start p-3 text-[10px] font-mono tabular-nums ${textColor}`}
            >
              {hex.toUpperCase()}
            </div>
          )
        })}
      </motion.div>

      {/* Typography + Avoid — rendered as a two-column spread on larger screens */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-12"
      >
        {typography.length > 0 && (
          <div>
            <p className="eyebrow mb-4">Typography</p>
            <ul className="space-y-2">
              {typography.map((t, i) => (
                <li key={`${t}-${i}`} className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-4 text-sm text-zinc-200">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
        {avoid.length > 0 && (
          <div>
            <p className="eyebrow mb-4">Avoid</p>
            <ul className="flex flex-wrap gap-2">
              {avoid.slice(0, 8).map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className="text-xs text-zinc-400 px-3 py-1.5 rounded-full border border-zinc-800/70 bg-zinc-900/30"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.section>

      {/* Mockups — editorial grid */}
      {brand.mockupUrls.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-12"
        >
          <p className="eyebrow mb-4">Mockups</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {brand.mockupUrls.map((m, i) => (
              <motion.a
                key={m.templateId}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.32 + i * 0.03 }}
                whileHover={{ y: -2 }}
                className="block aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/70 hover:border-zinc-600 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.templateId} className="w-full h-full object-cover" />
              </motion.a>
            ))}
          </div>
        </motion.section>
      )}

      {/* Owner-attached inspiration reference (absent on public share for privacy) */}
      {brand.referencePhotoUrl && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="mb-12"
        >
          <p className="eyebrow mb-4">Your inspiration</p>
          <div className="rounded-2xl overflow-hidden border border-zinc-800/70 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.referencePhotoUrl} alt="Inspiration" className="w-full object-cover max-h-96" />
          </div>
        </motion.section>
      )}

      {/* Action surface — provided by the caller */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.44 }}
      >
        {actions}
      </motion.div>
    </div>
  )
}

function isDark(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length < 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 140
}
