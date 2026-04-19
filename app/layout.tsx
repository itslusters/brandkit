import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { ClerkProvider } from '@clerk/nextjs'
import { GlassHeader } from '@/components/ui/GlassHeader'
import { InstallPrompt } from '@/components/InstallPrompt'
import { ToastProvider } from '@/components/ui/Toast'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = localFont({
  src: '../public/fonts/Inter-var.ttf',
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: { default: 'Atriium — Your brand, picked in minutes', template: '%s · Atriium' },
  description: 'A brand workspace that remembers your identity. Pick from AI-curated logos, names, palettes, and mockups — or keep refining until it fits.',
  keywords: ['AI logo generator', 'brand identity', 'AI branding', 'startup branding', 'brand workspace', 'Atriium'],
  applicationName: 'Atriium',
  appleWebApp: {
    capable: true,
    title: 'Atriium',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Atriium — Your brand, picked in minutes',
    description: 'A brand workspace that remembers your identity — pick logos, names, palettes, mockups.',
    type: 'website',
    url: 'https://brandkit-wheat.vercel.app',
    siteName: 'Atriium',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Atriium' }],
  },
  twitter: { card: 'summary_large_image', title: 'Atriium', description: 'Your brand, picked in minutes', images: ['/og.png'] },
  metadataBase: new URL('https://brandkit-wheat.vercel.app'),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          {/* Preconnect to blob storage + Clerk so the first image / auth
              handshake doesn't pay the DNS+TLS cost in the critical path. */}
          <link rel="preconnect" href="https://public.blob.vercel-storage.com" />
          <link rel="dns-prefetch" href="https://public.blob.vercel-storage.com" />
          <link rel="preconnect" href="https://clerk.com" crossOrigin="" />
          <link rel="dns-prefetch" href="https://clerk.com" />
        </head>
        <body className={`${inter.className} min-h-screen bg-zinc-950 text-white overflow-x-clip`}>
          <ToastProvider>
            <a href="#main-content" className="skip-link">Skip to content</a>
            <GlassHeader />
            <main
              id="main-content"
              tabIndex={-1}
              className="mx-auto max-w-md md:max-w-3xl min-h-screen px-4 py-8 focus:outline-none"
            >
              {children}
            </main>
            <InstallPrompt />
          </ToastProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
