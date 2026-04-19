import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="pt-16 md:pt-28 pb-12 max-w-2xl">
      <p className="eyebrow mb-4">404</p>
      <h1 className="display-2 text-white mb-5">This one wandered off.</h1>
      <p className="text-zinc-400 text-base leading-relaxed max-w-md mb-10">
        The page you tried to open isn&apos;t here. It might have been renamed,
        or the link you followed is stale. Let&apos;s get you back to something
        that exists.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={15} /> Back to home
        </Link>
        <Link href="/brand/new" className="btn btn-secondary">
          Start a new brand
        </Link>
      </div>
    </div>
  )
}
