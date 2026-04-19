import { Suspense } from 'react'
import { BrandForm } from '@/components/onboarding/BrandForm'

export default function NewBrandPage() {
  return (
    <div className="pt-4 pb-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Tell us about your brand</h1>
        <p className="text-zinc-500 text-sm mt-1">
          AI handles the rest — naming, style, logo, mockups. Saved to your account so your next request starts where this one ended.
        </p>
      </div>
      <Suspense>
        <BrandForm />
      </Suspense>
    </div>
  )
}
