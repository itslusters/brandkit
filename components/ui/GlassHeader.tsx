'use client'
import { useState, useEffect, useRef } from 'react'
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
 * Sticky glass header that reacts to the user's scroll intent:
 *   - idle at top: transparent, no border
 *   - scrolled down: glass blur + hairline border (the "scrolled" pass)
 *   - actively scrolling DOWN: hides (translateY off-screen) so the header
 *     stops eating vertical real estate when the user is skimming
 *   - actively scrolling UP: pops back into view
 * Hide threshold starts at ~80px so the header never flicks off on tiny
 * touch-bounces at the top of the page.
 */
export function GlassHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoaded } = useAuth()
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY
    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY.current
        setScrolled(y > 20)
        if (y < 80) {
          setHidden(false)
        } else if (delta > 6) {
          setHidden(true)
        } else if (delta < -6) {
          setHidden(false)
        }
        lastY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        style={{
          transform: hidden ? 'translateY(-110%)' : 'translateY(0)',
        }}
        className={`sticky top-0 z-40 flex items-center justify-between px-6 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out ${
          scrolled
            ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-black/20'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <a href="/" aria-label="Atriium — home" className="flex items-center">
          <img src="/atriium.svg" alt="Atriium" className="h-5 w-auto" />
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
