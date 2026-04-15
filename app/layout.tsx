import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BrandKit — AI Branding Engine',
  description: 'From company info to full brand package in minutes.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-white`}>
        <main className="mx-auto max-w-md min-h-screen px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
