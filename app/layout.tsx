import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'BrandKit — AI Branding Engine',
  description: 'From company info to full brand package in minutes.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} min-h-screen bg-zinc-950 text-white`}>
          <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <a href="/" className="text-sm font-semibold text-white">BrandKit</a>
            <div className="flex gap-3 items-center">
              <a href="/pricing" className="text-sm text-zinc-300 hover:text-white">Pricing</a>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm text-zinc-300 hover:text-white">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm bg-white text-zinc-950 px-3 py-1.5 rounded-md font-medium hover:bg-zinc-200">Sign up</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <a href="/account" className="text-sm text-zinc-300 hover:text-white">Account</a>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>
          <main className="mx-auto max-w-md md:max-w-3xl min-h-screen px-4 py-8">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}
