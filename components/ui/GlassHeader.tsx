'use client'
import { useState, useEffect } from 'react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'

export function GlassHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <a href="/" className="text-sm font-bold text-white tracking-tight">
        BrandKit
      </a>
      <div className="flex gap-3 items-center">
        <a href="/roast" className="text-sm text-red-400 hover:text-red-300 transition-colors">
          🔥 Roast
        </a>
        <a href="/company" className="text-sm text-zinc-400 hover:text-white transition-colors">
          About
        </a>
        <a href="/pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Pricing
        </a>
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
      </div>
    </header>
  )
}
