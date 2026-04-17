import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { GlassHeader } from '@/components/ui/GlassHeader'
import { InstallPrompt } from '@/components/InstallPrompt'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'BrandKit — AI Brand Kit Generator', template: '%s · BrandKit' },
  description: 'Get a complete brand identity in minutes — naming, logos, mockups, and brand guide PDF. AI-powered, designer-polished tier available.',
  keywords: ['AI logo generator', 'brand kit', 'AI branding', 'startup branding', 'brand identity'],
  applicationName: 'BrandKit',
  appleWebApp: {
    capable: true,
    title: 'BrandKit',
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
    title: 'BrandKit — AI Brand Kit Generator',
    description: 'Get a complete brand identity in minutes — naming, logos, mockups, brand guide.',
    type: 'website',
    url: 'https://brandkit-wheat.vercel.app',
    siteName: 'BrandKit',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'BrandKit' }],
  },
  twitter: { card: 'summary_large_image', title: 'BrandKit', description: 'AI brand kit generator', images: ['/og.png'] },
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
        <body className={`${inter.className} min-h-screen bg-zinc-950 text-white overflow-x-hidden`}>
          <GlassHeader />
          <main className="mx-auto max-w-md md:max-w-3xl min-h-screen px-4 py-8">
            {children}
          </main>
          <InstallPrompt />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
