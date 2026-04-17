'use client'
import { usePathname } from 'next/navigation'
import { FlowStepper } from '@/components/brand/FlowStepper'
import { DotGrid } from '@/components/ui/DotGrid'

const PATH_TO_STEP: Record<string, string> = {
  '/brand/new': 'new',
  '/brand/processing': 'processing',
  '/brand/naming': 'naming',
  '/brand/brief': 'brief',
  '/brand/logo/type': 'logo-type',
  '/brand/logo/studio': 'logo-studio',
  '/brand/mockup': 'mockup',
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const step = PATH_TO_STEP[pathname]

  return (
    <>
      <DotGrid />
      {step && <FlowStepper currentStep={step} />}
      <div className="relative z-10">{children}</div>
    </>
  )
}
