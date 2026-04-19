'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Props {
  name: string
  price: string
  priceSuffix: string
  features: string[]
  ctaLabel: string
  onCtaClick: () => void
  highlighted: boolean
}

export function PricingCard({ name, price, priceSuffix, features, ctaLabel, onCtaClick, highlighted }: Props) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative rounded-2xl p-6 border card-elevated transition-colors overflow-hidden h-full flex flex-col ${
        highlighted
          ? 'border-white/20 bg-zinc-900'
          : 'border-zinc-800/70 bg-zinc-900/40 hover:border-zinc-700'
      }`}
    >
      {highlighted && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-white/90 pointer-events-none">
            Popular
          </div>
        </>
      )}
      <div className="relative flex flex-col flex-1">
        <h3 className="text-base font-semibold text-white">{name}</h3>
        <p className="mt-2 text-2xl font-bold text-white">
          {price} <span className="text-xs font-normal text-zinc-500">{priceSuffix}</span>
        </p>
        <ul className="mt-5 space-y-2 flex-1">
          {features.map((f) => (
            <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
              <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" strokeWidth={3} />
              <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onCtaClick}
          className={`mt-6 w-full py-3 rounded-full font-semibold text-sm transition-all active:scale-[0.98] ${
            highlighted
              ? 'bg-white text-black hover:shadow-lg hover:shadow-white/10'
              : 'border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:text-white'
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    </motion.div>
  )
}
