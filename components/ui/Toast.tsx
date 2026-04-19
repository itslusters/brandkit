'use client'
import { createContext, useCallback, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, Info } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastApi {
  show: (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastCtx = createContext<ToastApi | null>(null)

/**
 * Lightweight global toast. Mount <ToastProvider> once near the root; call
 * useToast() inside any client component to show a message. Each toast
 * auto-dismisses after 3s, with a gentle slide + fade exit.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const api: ToastApi = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
  }

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div
        className="fixed z-[60] pointer-events-none flex flex-col items-center gap-2"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
          left: 0,
          right: 0,
        }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx)
  if (!ctx) {
    // Fail-soft: if provider isn't mounted (edge case), console log instead.
    return {
      show: (m) => console.warn('[toast]', m),
      success: (m) => console.warn('[toast:success]', m),
      error: (m) => console.warn('[toast:error]', m),
    }
  }
  return ctx
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const Icon = toast.variant === 'success' ? Check : toast.variant === 'error' ? AlertCircle : Info
  const iconTone =
    toast.variant === 'success' ? 'text-emerald-400' :
    toast.variant === 'error' ? 'text-red-400' : 'text-blue-400'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/70 shadow-2xl shadow-black/40"
    >
      <Icon size={14} className={iconTone} strokeWidth={2.5} />
      <p className="text-sm font-medium text-white pr-0.5">{toast.message}</p>
    </motion.div>
  )
}

// Mount the provider from app/layout.tsx — tiny no-op default that's safe for SSR.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function _NoOpLayoutMount() {
  useEffect(() => {}, [])
  return null
}
