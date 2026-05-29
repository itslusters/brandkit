// Shown instantly while the landing's public-brands fetch runs — replaces the
// blank/black gap on cold entry (the feed Server Component awaits Upstash).
export default function Loading() {
  return (
    <div className="-mt-8 -mx-4 grid grid-cols-2 gap-2 md:grid-cols-3" aria-busy="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-900" />
      ))}
    </div>
  )
}
