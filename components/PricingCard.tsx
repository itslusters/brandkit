'use client'

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
    <div className={`rounded-2xl p-6 border card-elevated transition-colors ${
      highlighted
        ? 'border-white/20 bg-zinc-900 relative overflow-hidden'
        : 'border-zinc-800/60 bg-zinc-950'
    }`}>
      {/* Subtle gradient shimmer on highlighted card */}
      {highlighted && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
      )}
      <div className="relative">
        <h3 className="text-base font-semibold text-white">{name}</h3>
        <p className="mt-2 text-3xl font-bold text-white">
          {price} <span className="text-xs font-normal text-zinc-500">{priceSuffix}</span>
        </p>
        <ul className="mt-5 space-y-2">
          {features.map((f) => (
            <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onCtaClick}
          className={`mt-6 w-full py-3 rounded-full font-semibold text-sm transition-all ${
            highlighted
              ? 'bg-white text-black hover:shadow-lg hover:shadow-white/10'
              : 'border border-zinc-700 text-zinc-200 hover:border-zinc-500'
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}
