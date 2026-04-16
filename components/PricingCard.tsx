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
    <div className={`rounded-2xl p-6 border ${highlighted ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-zinc-950'}`}>
      <h3 className="text-base font-semibold text-white">{name}</h3>
      <p className="mt-2 text-3xl font-bold text-white">
        {price} <span className="text-xs font-normal text-zinc-500">{priceSuffix}</span>
      </p>
      <ul className="mt-5 space-y-2">
        {features.map((f) => (
          <li key={f} className="text-sm text-zinc-300 flex items-start gap-2">
            <span className="text-zinc-500 mt-0.5">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onCtaClick}
        className={`mt-6 w-full py-3 rounded-xl font-semibold text-sm ${
          highlighted ? 'bg-white text-black' : 'border border-zinc-700 text-zinc-200'
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  )
}
