'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

/**
 * Korean-language waitlist landing. Standalone page — deliberately not wired
 * through next-intl yet so we can A/B test positioning without committing to
 * a full i18n refactor. Copy maps to /docs/research/korean-market.md pains.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PAIN_POINTS = [
  {
    title: '로고 하나 만들어도 썸네일, 배너는 또 따로',
    body: '스마트스토어, 인스타, 유튜브 규격 다 다른데 매주 새로 찍어내야 해요. 플랫폼마다 미리캔버스 켜는 거 그만하고 싶어요.',
  },
  {
    title: '크몽에서 받은 로고, 벡터 파일 없이 PNG만',
    body: '1년 뒤에 명함 인쇄하거나 사이니지 맡길 때 결국 다시 해야 돼요. SVG 소유권, 상업적 사용권 다 챙긴 채로 시작하세요.',
  },
  {
    title: 'AI 로고 툴은 "딱 이거다" 싶은 게 안 나와요',
    body: '템플릿 섞은 느낌만 나고 수정하려면 크레딧 또 결제. 3개 변형 중 마음에 드는 거 없으면 바로 디자이너한테 넘길 수 있게 만들었어요.',
  },
]

export default function KoreanWaitlistPage() {
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const finalEmail = email.trim().toLowerCase()
    if (!EMAIL_RE.test(finalEmail)) {
      setError('이메일 형식을 확인해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalEmail, plan: 'essentials', note: note.trim() || undefined }),
      })
      if (!res.ok) {
        if (res.status === 429) {
          setError('요청이 너무 많습니다. 내일 다시 시도해주세요.')
        } else {
          const j = await res.json().catch(() => ({})) as { message?: string }
          setError(j.message ?? '오류가 발생했습니다.')
        }
        return
      }
      trackEvent('waitlist_signup', { locale: 'ko', plan: 'essentials', has_note: Boolean(note.trim()) })
      setDone(true)
    } catch {
      setError('네트워크 오류. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-6 pb-16 max-w-2xl mx-auto">
      {done ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-5">
            <Check size={22} className="text-emerald-400" strokeWidth={3} />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">웨이팅 리스트에 등록됐어요.</h1>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            정식 오픈 1주 전에 이메일로 알려드려요. 얼리버드 유저는 첫 3개월 <span className="text-white">월 9,900원</span> (정가 월 25,000원).
          </p>
          <a href="/" className="btn btn-secondary">
            메인으로 <ArrowRight size={15} />
          </a>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <p className="eyebrow mb-3">베타 웨이팅 리스트</p>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">
              하나의 브랜드로<br />모든 채널 에셋.
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
              스마트스토어 썸네일, 인스타 포스트, 유튜브 인트로, 앱 아이콘 — 같은 브랜드 DNA로 자동 변환.
              벡터 SVG + 상업적 사용권 포함. 정식 오픈 5월 예정.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={submit}
            className="mb-12 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 p-5 md:p-6"
          >
            <label className="block text-xs text-zinc-500 mb-2">이메일</label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="input"
            />
            <label className="block text-xs text-zinc-500 mt-4 mb-2">어떤 작업 때문에 오셨나요? <span className="text-zinc-700">(선택)</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              placeholder="예: 스마트스토어 운영 중인데 매주 썸네일 10장 만드는 게 버거워요"
              className="input resize-none h-24 text-sm"
            />
            {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full btn-lg mt-5"
            >
              {loading ? '등록 중…' : <>웨이팅 리스트 등록 <ArrowRight size={15} /></>}
            </button>
            <p className="text-[11px] text-zinc-600 mt-3 leading-relaxed">
              얼리버드: 정식 오픈 후 첫 3개월 월 9,900원 (정가 월 25,000원 예정).
              이메일은 알림 용도 외 사용 안 해요.
            </p>
          </motion.form>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <p className="eyebrow mb-2">이런 분들한테 만들었어요</p>
            {PAIN_POINTS.map((p) => (
              <div key={p.title} className="rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-5">
                <p className="text-sm font-semibold text-white mb-1.5">{p.title}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </motion.section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 text-xs text-zinc-500 leading-relaxed"
          >
            <p>
              베타 기간 동안 Free 티어로 브랜드 브리프 / 로고 3개 변형 / A/B 폴까지 지금 바로 써볼 수 있어요 —{' '}
              <a href="/brand/new" className="text-zinc-300 underline hover:text-white">브랜드 만들기 →</a>
            </p>
          </motion.div>
        </>
      )}
    </div>
  )
}
