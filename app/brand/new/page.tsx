import { BrandForm } from '@/components/onboarding/BrandForm'

export default function NewBrandPage() {
  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Tell us about your brand</h1>
        <p className="text-zinc-500 text-sm mt-1">
          AI will handle the rest — naming, style, logo, mockups.
        </p>
      </div>
      <BrandForm />
    </div>
  )
}
