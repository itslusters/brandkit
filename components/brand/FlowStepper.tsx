'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

/**
 * Number-based progress rail for the brand-creation flow. Seven small dots,
 * one per step. Active is a filled white chip with its step number; past
 * steps are solid zinc and tappable (routes back); future steps are a
 * ghosted outline. We dropped labels because the expanding active pill was
 * colliding with the other numbers on phones narrower than ~360px.
 */

const STEPS = [
  { id: 'new', path: '/brand/new' },
  { id: 'processing', path: '/brand/processing' },
  { id: 'naming', path: '/brand/naming' },
  { id: 'brief', path: '/brand/brief' },
  { id: 'logo-type', path: '/brand/logo/type' },
  { id: 'logo-studio', path: '/brand/logo/studio' },
  { id: 'mockup', path: '/brand/mockup' },
]

interface Props {
  currentStep: string
}

export function FlowStepper({ currentStep }: Props) {
  const router = useRouter()
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep)
  const progress = currentIdx < 0 ? 0 : currentIdx / (STEPS.length - 1)

  return (
    <div className="mb-8">
      <div className="relative rounded-2xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-sm px-3 py-3 overflow-hidden">
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
            return (
              <div key={step.id} className="flex items-center gap-1.5 flex-1 last:flex-none min-w-0">
                <button
                  type="button"
                  disabled={!isPast}
                  onClick={() => isPast && router.push(step.path)}
                  aria-label={`Step ${i + 1}${isPast ? ' — go back' : isCurrent ? ' — current' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`relative h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold tabular-nums transition-colors ${
                    isCurrent
                      ? 'bg-white text-zinc-950 shadow-lg shadow-white/10'
                      : isPast
                        ? 'bg-zinc-700 text-zinc-950 hover:bg-zinc-500 cursor-pointer'
                        : 'bg-transparent border border-zinc-700 text-zinc-600 cursor-default'
                  }`}
                >
                  {i + 1}
                </button>

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
      <p className="mt-2 text-[11px] text-zinc-500 tabular-nums">
        Step {currentIdx + 1} of {STEPS.length}
      </p>
    </div>
  )
}
