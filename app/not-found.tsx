export default function NotFound() {
  return (
    <div className="pt-20 pb-12 text-center">
      <p className="text-6xl font-bold gradient-text mb-4">404</p>
      <p className="text-lg text-zinc-400 mb-8">This page doesn&apos;t exist.</p>
      <a
        href="/"
        className="inline-flex items-center justify-center bg-white text-zinc-950 px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors"
      >
        Back to home
      </a>
    </div>
  )
}
