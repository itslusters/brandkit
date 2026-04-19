'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import { X, ArrowUpRight } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const NAV_LINKS = [
  { href: '/', label: 'Home', eyebrow: 'Start' },
  { href: '/pricing', label: 'Pricing', eyebrow: 'Plans' },
  { href: '/company', label: 'About', eyebrow: 'Story' },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isLoaded } = useAuth()

  // Body scroll lock while the sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-zinc-950 flex flex-col"
        >
          {/* Ambient color wash */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="aurora-glow w-[500px] h-[400px] bg-blue-600/12 top-[15%] left-[-10%]" style={{ animationDelay: '0s' }} />
            <div className="aurora-glow w-[420px] h-[360px] bg-violet-600/10 bottom-[10%] right-[-10%]" style={{ animationDelay: '2s' }} />
          </div>

          {/* Top bar with close */}
          <div
            className="relative flex items-center justify-between px-6 py-4"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
          >
            <img src="/atriium.svg" alt="Atriium" className="h-5 w-auto" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav — editorial layout */}
          <nav className="relative flex-1 flex flex-col px-6 pt-6">
            <div className="space-y-1">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-end justify-between gap-4 py-4 border-b border-zinc-800/60"
                >
                  <div>
                    <p className="eyebrow mb-1">{link.eyebrow}</p>
                    <p className="text-3xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors" style={{ letterSpacing: '-0.02em' }}>
                      {link.label}
                    </p>
                  </div>
                  <ArrowUpRight size={22} className="text-zinc-600 group-hover:text-white transition-colors shrink-0 mb-1.5" />
                </motion.a>
              ))}
            </div>

            {/* Auth surface — pinned to the bottom */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="mt-auto pb-8 pt-8"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
            >
              {isLoaded ? (
                <>
                  <SignedOut>
                    <div className="flex flex-col gap-2">
                      <SignUpButton mode="modal">
                        <button className="btn btn-primary btn-full btn-lg">
                          Sign up — free
                        </button>
                      </SignUpButton>
                      <SignInButton mode="modal">
                        <button className="btn btn-secondary btn-full">
                          Sign in
                        </button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 px-4 py-3">
                      <a
                        href="/account"
                        onClick={onClose}
                        className="flex-1 flex items-center gap-3 min-w-0"
                      >
                        <UserButton afterSignOutUrl="/" />
                        <span className="text-sm font-semibold text-white">Account</span>
                      </a>
                      <ArrowUpRight size={16} className="text-zinc-500 shrink-0" />
                    </div>
                  </SignedIn>
                </>
              ) : (
                <div className="h-12" />
              )}
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
