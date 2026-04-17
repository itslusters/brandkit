'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'

interface RoastResult {
  overallGrade: string
  verdict: string
  nameScore: string
  positioningScore: string
  differentiationScore: string
  emotionalScore: string
  details: { name: string; positioning: string; differentiation: string; emotional: string }
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-emerald-400', 'A': 'text-emerald-400',
  'B+': 'text-blue-400', 'B': 'text-blue-400',
  'C+': 'text-yellow-400', 'C': 'text-yellow-400',
  'D+': 'text-orange-400', 'D': 'text-orange-400',
  'F': 'text-red-400',
}

export default function RoastPage() {
  const [brandName, setBrandName] = useState('')
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState('')

  async function roast() {
    if (!brandName.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: brandName.trim(), industry: industry.trim() || undefined }),
      })
      if (!res.ok) {
        setError('Could not analyze. Try again.')
        return
      }
      const { result: r } = await res.json()
      setResult(r)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-4 pb-12 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Flame size={24} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Roast My Brand</h1>
        <p className="text-zinc-500 text-sm mt-1">Get a brutally honest AI brand audit.</p>
      </div>

      {!result && (
        <div className="space-y-4">
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Brand name"
            onKeyDown={(e) => e.key === 'Enter' && roast()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Industry (optional)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={roast}
            disabled={!brandName.trim() || loading}
            className="w-full py-3 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-40"
          >
            {loading ? 'Analyzing...' : '🔥 Roast it'}
          </button>
          {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Grade hero */}
            <div className="text-center dot-grid-card relative rounded-2xl border border-zinc-800 bg-zinc-900/40 py-10">
              <div className="relative z-10">
                <p className={`text-7xl font-black ${GRADE_COLORS[result.overallGrade] ?? 'text-zinc-400'}`}>
                  {result.overallGrade}
                </p>
                <p className="text-sm text-zinc-400 mt-3 max-w-xs mx-auto px-4">{result.verdict}</p>
              </div>
            </div>

            {/* Dimension scores */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Name', score: result.nameScore, detail: result.details.name },
                { label: 'Positioning', score: result.positioningScore, detail: result.details.positioning },
                { label: 'Differentiation', score: result.differentiationScore, detail: result.details.differentiation },
                { label: 'Emotional', score: result.emotionalScore, detail: result.details.emotional },
              ].map((d) => (
                <div key={d.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-zinc-500">{d.label}</p>
                    <p className={`text-sm font-bold ${GRADE_COLORS[d.score] ?? 'text-zinc-400'}`}>{d.score}</p>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{d.detail}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-4">
              <a
                href="/brand/new"
                className="w-full inline-flex items-center justify-center bg-white text-zinc-950 px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors"
              >
                Fix it — generate a new brand →
              </a>
              <button
                onClick={() => { setResult(null); setBrandName(''); setIndustry('') }}
                className="w-full inline-flex items-center justify-center border border-zinc-700 text-zinc-300 px-6 py-3 rounded-full font-medium hover:border-zinc-500 transition-colors"
              >
                Roast another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
