'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

/**
 * Multi-step progress indicator for the brand-creation flow.
 *
 * Visual model: a floating glass capsule that hosts all seven steps. The
 * active step is the hero — filled white chip with its label visible — while
 * past steps collapse into small solid check dots and future steps into
 * hollow outlines. The rail between them fills as progress accumulates.
 *
 * Interaction: past steps are tappable and route back to their respective
 * page; future steps are inert. All state changes animate with a spring so
 * the transition from "building" to "complete" feels tactile.
 */

const STEPS = [
  { id: 'new', label: 'Info', path: '/brand/new' },
  { id: 'processing', label: 'AI', path: '/brand/processing' },
  { id: 'naming', label: 'Name', path: '/brand/naming' },
  { id: 'brief', label: 'Brief', path: '/brand/brief' },
  { id: 'logo-type', label: 'Type', path: '/brand/logo/type' },
  { id: 'logo-studio', label: 'Logo', path: '/brand/logo/studio' },
  { id: 'mockup', label: 'Mockup', path: '/brand/mockup' },
]

interface Props {
  currentStep: string
}

export function FlowStepper({ currentStep }: Props) {
  const router = useRouter()
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep)
  const progress = currentIdx < 0 ? 0 : currentIdx / (STEPS.length - 1)
  const activeStep = STEPS[currentIdx]

  return (
    <div className="mb-8">
      <div className="relative rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-3 py-3 overflow-hidden">
        {/* Background progress fill — subtle tint that grows with progress */}
        <motion.div
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-transparent pointer-events-none"
        />

        <div className="relative flex items-center gap-1.5">
          {STEPS.map((step, i) => {
            const isPast = i < currentIdx
            const isCurrent = i === currentIdx
            const isFuture = i > currentIdx

            return (
              <div key={step.id} className="flex items-center gap-1.5 flex-1 last:flex-none min-w-0">
                <motion.button
                  type="button"
                  disabled={!isPast}
                  onClick={() => isPast && router.push(step.path)}
                  aria-label={`${step.label}${isPast ? ' — go back' : isCurrent ? ' — current step' : ''}`}
                  initial={false}
                  animate={{
                    width: isCurrent ? 'auto' : 24,
                    paddingLeft: isCurrent ? 10 : 0,
                    paddingRight: isCurrent ? 12 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className={`relative h-6 rounded-full flex items-center justify-center gap-1.5 shrink-0 overflow-hidden ${
                    isCurrent
                      ? 'bg-white text-zinc-950 shadow-lg shadow-white/10'
                      : isPast
                        ? 'bg-zinc-700 text-zinc-950 hover:bg-zinc-500 cursor-pointer'
                        : 'bg-transparent border border-zinc-700 text-zinc-600 cursor-default'
                  }`}
                >
                  {isPast && <Check size={11} strokeWidth={3} />}
                  {isCurrent && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[11px] font-semibold tracking-tight whitespace-nowrap"
                    >
                      {step.label}
                    </motion.span>
                  )}
                  {isFuture && (
                    <span className="text-[9px] font-semibold tabular-nums">{i + 1}</span>
                  )}
                </motion.button>

                {i < STEPS.length - 1 && (
                  <div className="flex-1 min-w-[8px] relative h-px">
                    <div className="absolute inset-0 bg-zinc-800" />
                    <motion.div
                      initial={false}
                      animate={{ scaleX: isPast ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 bg-zinc-400 origin-left"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {/* Step counter — gives a literal "3 of 7" anchor beneath the capsule */}
      {activeStep && (
        <p className="mt-2 text-[11px] text-zinc-500 tracking-wide tabular-nums">
          Step {currentIdx + 1} of {STEPS.length} · {activeStep.label}
        </p>
      )}
    </div>
  )
}
