'use client'
import { usePathname } from 'next/navigation'

/**
 * Global footer. Renders once per page at the bottom of the layout flex
 * column so short pages don't leak the body gradient below content. Copy
 * flips to Korean when the user is browsing `/ko/*`.
 */
export function Footer() {
  const pathname = usePathname() ?? ''
  const isKorean = pathname === '/ko' || pathname.startsWith('/ko/')

  const links = isKorean
    ? [
      { href: '/company', label: '소개' },
      { href: '/pricing', label: '가격' },
      { href: '/privacy', label: '개인정보' },
      { href: '/terms', label: '약관' },
      { href: 'mailto:we.lusters@gmail.com', label: '문의' },
    ]
    : [
      { href: '/company', label: 'About' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: 'mailto:we.lusters@gmail.com', label: 'Contact' },
    ]

  return (
    <footer className="relative border-t border-zinc-800/40 bg-zinc-950 py-6 px-6">
      <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
        <div className="flex gap-4 flex-wrap">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hover:text-zinc-300 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
        <span>© 2026 Atriium</span>
      </div>
    </footer>
  )
}
