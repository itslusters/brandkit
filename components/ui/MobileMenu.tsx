'use client'
import { useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isLoaded } = useAuth()

  // Body scroll lock
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
    <div
      className={`fixed inset-0 z-50 bg-zinc-950 flex flex-col transition-all duration-200 ease-out ${
        isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {/* Close button */}
      <div className="flex justify-end px-6 py-4">
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex flex-col items-center justify-center flex-1 gap-8">
        <a
          href="/company"
          onClick={onClose}
          className="text-2xl text-zinc-300 hover:text-white transition-colors"
        >
          About
        </a>
        <a
          href="/pricing"
          onClick={onClose}
          className="text-2xl text-zinc-300 hover:text-white transition-colors"
        >
          Pricing
        </a>

        {isLoaded ? (
          <>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-2xl text-zinc-300 hover:text-white transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-2xl bg-white text-zinc-950 px-6 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors">
                  Sign up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <a
                href="/account"
                onClick={onClose}
                className="text-2xl text-zinc-300 hover:text-white transition-colors"
              >
                Account
              </a>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </>
        ) : (
          <div className="w-24 h-8" />
        )}
      </nav>
    </div>
  )
}
