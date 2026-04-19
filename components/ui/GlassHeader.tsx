'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import { MobileMenu } from './MobileMenu'

/**
 * Sticky glass header. Always visible — only its chrome reacts to scroll:
 *   - idle at top: transparent, no border
 *   - scrolled past 20px: glass blur + hairline border
 * We don't hide on scroll-down because a dissapearing header on a brand
 * tool feels flaky; users lose their "where am I" anchor mid-flow.
 */
export function GlassHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoaded } = useAuth()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-40 flex items-center justify-between px-6 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
          scrolled
            ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <a href="/" aria-label="Atriium — home" className="flex items-center">
          <img src="/atriium-wordmark.svg" alt="Atriium" className="h-5 w-auto" />
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-3 items-center">
          <a href="/company" className="text-sm text-zinc-400 hover:text-white transition-colors">
            About
          </a>
          <a href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Pricing
          </a>

          {isLoaded ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm bg-white text-zinc-950 px-3.5 py-1.5 rounded-full font-medium hover:bg-zinc-200 transition-colors">
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <a href="/account" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Account
                </a>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </>
          ) : (
            <div className="w-16 h-6" />
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-zinc-400 hover:text-white transition-colors text-xl leading-none"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
