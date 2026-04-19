'use client'
import { motion } from 'framer-motion'

interface Props {
  totalCount: number
}

const FREE_FEATURES = [
  'AI 브랜드 브리프 + 네이밍',
  '로고 3가지 변형 생성',
  '클린 PNG 로고 다운로드',
  '브랜드 A/B 투표',
  '최대 3개 브랜드 저장',
]

const PAID_FEATURES = [
  '9가지 포토리얼 목업',
  '벡터 SVG 로고',
  'PDF 브랜드 가이드 + 에셋 ZIP',
  '브랜드 무제한 저장',
  '실제 디자이너 리파인',
]

/**
 * Korean-language mirror of FeedGate. Copy adapted from the research-backed
 * Korean positioning (vector ownership + multi-channel stretch + brand
 * memory). Kept as a separate component rather than a prop-flipped variant
 * because the Korean section needs its own character rhythm — machine-
 * translated English reads as a translation.
 */
export function KoreanFeedGate({ totalCount }: Props) {
  return (
    <div className="relative mt-[-200px] pt-[200px]">
      <div className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-transparent to-zinc-950 pointer-events-none" />

      <div className="relative bg-zinc-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="aurora-glow w-[600px] h-[400px] bg-blue-600/20 top-[20%] left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="aurora-glow w-[500px] h-[400px] bg-violet-600/15 top-[30%] right-[5%]" style={{ animationDelay: '2s' }} />
          <div className="aurora-glow w-[400px] h-[300px] bg-indigo-500/10 bottom-[10%] left-[30%]" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="eyebrow mb-5"
            >
              브랜드 워크스페이스
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="display-2 text-white mb-5"
            >
              하나의 브랜드,<br />모든 채널.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed mb-10"
            >
              로고 한 번 만들면 스마트스토어 썸네일, 인스타 포스트, 앱 아이콘까지
              같은 DNA로 자동 변환. 벡터 SVG + 상업적 사용권 기본 포함.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mb-10 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <a href="/brand/new" className="btn btn-primary btn-lg">
                무료로 시작하기
              </a>
              <a href="/ko/waitlist" className="btn btn-secondary btn-lg">
                얼리버드 등록
              </a>
            </motion.div>

            {totalCount > 0 && (
              <p className="text-xs text-zinc-600 mb-10">
                {totalCount.toLocaleString()}개의 브랜드가 Atriium에서 만들어졌어요
              </p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="border-t border-zinc-800/60 pt-8 max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 text-left"
            >
              <div>
                <p className="eyebrow mb-4">무료, 첫날부터</p>
                <ul className="space-y-2.5">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-200">
                      <span className="text-blue-400 mt-0.5" aria-hidden>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-4">유료로 열리는 것</p>
                <ul className="space-y-2.5">
                  {PAID_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
                      <span className="text-zinc-500 mt-0.5" aria-hidden>+</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  )
}
