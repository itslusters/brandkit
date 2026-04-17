'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const STEPS = [
  { id: 'new', label: 'Info' },
  { id: 'processing', label: 'AI' },
  { id: 'naming', label: 'Name' },
  { id: 'brief', label: 'Brief' },
  { id: 'logo-type', label: 'Type' },
  { id: 'logo-studio', label: 'Logo' },
  { id: 'mockup', label: 'Mockup' },
]

interface Props {
  currentStep: string  // matches a STEPS id
}

export function FlowStepper({ currentStep }: Props) {
  const currentIdx = STEPS.findIndex(s => s.id === currentStep)

  return (
    <div className="flex items-center justify-between gap-1 mb-8 px-1">
      {STEPS.map((step, i) => {
        const isPast = i < currentIdx
        const isCurrent = i === currentIdx
        const isFuture = i > currentIdx

        return (
          <div key={step.id} className="flex items-center gap-1 flex-1 last:flex-none">
            {/* Step dot/check */}
            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1 : 0.85,
                backgroundColor: isPast ? '#ffffff' : isCurrent ? '#ffffff' : '#27272a',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`relative w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                isCurrent ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-zinc-950' : ''
              }`}
            >
              {isPast ? (
                <Check size={12} className="text-zinc-950" strokeWidth={3} />
              ) : (
                <span className={`text-[9px] font-bold tabular-nums ${
                  isCurrent ? 'text-zinc-950' : 'text-zinc-600'
                }`}>
                  {i + 1}
                </span>
              )}
            </motion.div>

            {/* Label — visible on current + neighbors only for cleanliness */}
            <span className={`text-[10px] font-medium tracking-wide hidden sm:block ${
              isCurrent ? 'text-white' : isPast ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              {step.label}
            </span>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1">
                <motion.div
                  initial={false}
                  animate={{ scaleX: isPast ? 1 : 0, opacity: isPast ? 1 : 0.2 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full bg-zinc-600 origin-left"
                  style={{ scaleX: isPast ? 1 : 0.3 }}
                />
                <div className="h-px bg-zinc-800 -mt-px" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
