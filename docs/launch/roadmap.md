# Marketing Roadmap — Korea × Global

12주 실행 로드맵. 한국/글로벌 이원화 전략, 자동화 가능 항목은 코드로
구현되어 있고, 나머지는 창업자 실행 리스트로 분리했다. 각 항목마다
**성공 지표**와 **책임 채널**을 명시.

**큰 원칙**:
1. 한국은 "가까운 커뮤니티, 메시지 현지화"로 **CAC 낮게** 시작
2. 글로벌은 "빌드인퍼블릭 + Apple editorial + PH 런칭"으로 **신뢰도 레버리지**
3. 자동화할 수 있는 것은 코드로 (이메일 시퀀스, 하이프랭, 추천 코드)
4. 자동화 못 하는 것 (대화, 커뮤니티) 은 명시된 실행 리스트로

---

## 🎯 North Star Metrics

| 지표 | 12주차 목표 | 측정 위치 |
|------|-----------|---------|
| Waitlist signups | 2,500 | Upstash `waitlist:*` 키 |
| Daily active brand generators | 300 | Vercel Analytics `brand_new_start` |
| Free → paid conversion | 5% | `paid_checkout_start` / `brand_save_success` |
| Free-to-Solo monthly retention (Month 1) | 40% | RevenueCat webhook events |
| Inbound organic traffic | 5,000 sessions/월 | Vercel Analytics |

---

## 🇰🇷 한국 시장 전략

### 왜 한국 먼저

- 네가 한국어 네이티브, 한국 커뮤니티 접근 가능 (CAC 낮음)
- 크몽/라우드소싱 고객의 **벡터+상업적 사용권** 페인 실존 (research 문서 참조)
- 1인 스마트스토어/인스타 셀러 시장 규모 큼
- Apple Korea 심사 트래픽 + Naver 검색 SEO 결과 선점 가능

### Week 1~2: 기반
- [x] `/ko/waitlist` 한글 페이지 출시
- [x] Claude 한글 네이밍 모드
- [ ] `/ko` 풀 랜딩 페이지 (피드 + 포지셔닝 + CTA) — 이 커밋에서 추가
- [ ] hreflang 메타태그로 영/한 페이지 구분 (SEO) — 이 커밋
- [ ] 디스퀘어 계정 생성 + 첫 포스트 예약

### Week 3~4: 커뮤니티 시드
- [ ] **디스퀘어**: Atriium MVP 포스트 (channels.md 메시지 사용)
  - 목표: 300 뷰, 50 waitlist
- [ ] **네이버 카페 3곳**: 창업공감 / 인스타마켓정보공유 / 쇼핑몰창업 진입
  - 각 카페 규칙 준수, 광고 카테고리 사용
  - 목표: 카페별 100 뷰, 10~20 waitlist
- [ ] **오픈카톡방 2개**: "1인 창업", "스마트스토어 노하우" 질문형 진입
  - 목표: 개별 DM 20건
- [ ] Naver 블로그에 "브랜드 AI 만들기 비교" 글 1개 (SEO seed)

### Week 5~6: 유료 실험
- [ ] **네이버 검색 광고**: "로고 제작", "스마트스토어 썸네일"
  - 예산: 일 5,000원 × 7일 = 35,000원
  - 목표 CPC: 2,000원 이하, CTR: 3% 이상
- [ ] **Meta 광고**: 인스타 셀러 타겟
  - 예산: $5~10/일 × 7일 = $50
  - 크리에이티브: 10초 시연 영상
- [ ] **CAC 측정 → 수치 문서화**: `docs/launch/metrics.md` (추가 예정)

### Week 7~8: 증폭
- [ ] **Product Hunt Korea** 런칭
- [ ] 디스퀘어 Weekly Pick 신청
- [ ] 유튜브 쇼츠 / 릴스: "브랜드 10분 만에" 데모 (주 3개)

### Week 9~12: 전환 최적화
- [ ] 한국 유저 대상 uptour / onboarding 뜯어고치기 (행동 데이터 기반)
- [ ] 한글 로고 베타 출시 (satori + Pretendard)
- [ ] 한국 SMB 특화 목업 템플릿 추가 (네이버 썸네일, 카카오 프로필)
- [ ] 토스페이먼츠 블로그 인터뷰 제안

### 한국 채널별 기대값 (research 기반)

| 채널 | 유입 | 전환율 | CAC 예상 |
|------|------|-------|---------|
| 디스퀘어 | 500 | 15% | 무료 |
| 네이버 카페 × 3 | 1,000 | 10% | 무료 |
| 오픈카톡방 × 2 | 200 | 30% (대화형) | 무료 |
| 네이버 광고 (7일) | 1,000 | 3% | ₩2,000/signup |
| Meta 광고 (7일) | 1,500 | 2% | $2/signup |
| Product Hunt KR | 800 | 10% | 무료 |

**12주 한국 waitlist 목표: 1,200명**

### 한국 메시지 원칙 (research-backed)

✅ Do:
- "벡터 SVG + 상업적 사용권 기본"
- "하나의 브랜드, 모든 채널"
- "벡터 없이 PNG만 받으면 재작업 비용"
- 얼리버드 할인 강조

🚫 Don't:
- "크몽에서 기다리지 마세요" (촌스럽고 데이터로 틀림)
- "AI로 10분만에" (Canva 한국어도 같은 주장)
- "저렴하게" (가격전쟁에서 진다)

---

## 🌍 글로벌 전략

### 왜 글로벌도 병행

- Apple editorial 타겟은 글로벌 시장 (Apple Design Award 후보는 영어 마켓)
- Product Hunt 메인 커뮤니티 영어권
- Twitter 빌드인퍼블릭 도달 글로벌
- 구독 결제는 Apple IAP로 즉시 전세계 가능

### Week 1~4: 빌드인퍼블릭 씨앗

- [ ] **Twitter 계정 개설 @atriiumapp (또는 @seongilmin)**
- [ ] 매일 1 포스트, 하위 템플릿:
  - Monday: 지난주 숫자 (waitlist N명, 이번주 목표)
  - Tuesday: 제품 결정 or 실수 공개
  - Wednesday: 유저 인용 or 피드백
  - Thursday: 기술 블로그 (Recraft 프롬프트, Capacitor 이슈 등)
  - Friday: 스샷/데모 gif
- [ ] **LinkedIn 장문 포스트** 월 2회 (린치핀 분석/포지셔닝 사고)
- [ ] 개인 블로그 or Substack 설립 → "Building Atriium" 뉴스레터

### Week 5~8: 커뮤니티 침투

- [ ] **Indie Hackers**: launch thread + "How I priced my subscription tiers" 에세이
- [ ] **r/SideProject**: 서비스 런치 포스트 (Sunday showcase 활용)
- [ ] **Product Hunt**: 런치일 사전 예약 (최소 200 follower 확보 후)
- [ ] **Designer Slack 커뮤니티**: Dribbble, Women Who Design, Designer Hangout
- [ ] 호스팅 챌린지: **"Atriium Weekly Brand Challenge"**
  - 테마 (e.g., "Minimal fintech", "Artisan coffee") 공개 → 유저가 Atriium으로 만들기 → 최고 3개 주간 피처
  - 목표: 유저 기여 + 공개 피드 콘텐츠 자동 생성

### Week 9~12: 폭발 단계

- [ ] **Product Hunt 런칭** (영어권) — waitlist 2,000+ 기준
- [ ] **Apple editorial 피치**: Apple Developer Relations 공식 이메일로 제품 소개 pitch
- [ ] **BetaList 제출**: pre-launch 트래픽용
- [ ] **The Keyword** (Substack) 같은 디자인 뉴스레터에 스폰서 or 기고
- [ ] YouTube long-form: "How I built Atriium in 12 weeks" (30분) — evergreen 콘텐츠

### 글로벌 채널별 기대값

| 채널 | 유입 | 전환율 | CAC 예상 |
|------|------|-------|---------|
| Twitter (90일 누적) | 5,000 | 5% | 시간만 |
| Indie Hackers | 800 | 8% | 시간만 |
| r/SideProject | 500 | 6% | 시간만 |
| Product Hunt (global) | 3,000 | 10% | 1일 대응 |
| Dribbble + Designer Slack | 400 | 10% | 시간만 |
| Apple editorial (if picked) | 10,000+ | N/A | Apple 주도 |
| Weekly Brand Challenge | 200/주 | 15% | 시간만 |

**12주 글로벌 waitlist 목표: 1,500명**

### 글로벌 메시지 원칙

✅ Do:
- "The brand workspace for one-person operations"
- "Vector SVG + commercial rights out of the box"
- "Brand memory" (거의 아무도 안 쓰는 강한 시그니처 단어)
- Build-in-public 숫자 공개

🚫 Don't:
- 경쟁사 비교 카피 ("Better than Canva") — 유치
- "AI-powered" 반복 — 이미 포화
- 한국 감성 카피 직역 (한국 셀러 페인 포인트 영어로 옮기면 안 통함)

---

## 🔧 자동화 스택 (이 커밋에서 구축)

### 1. Hreflang SEO 태그
`/` 영문 / `/ko/*` 한글 페이지 Google이 구분하게. `app/layout.tsx` 에
alternates 추가.

### 2. 이메일 드립 시퀀스 (Resend)
Waitlist 가입 즉시 welcome 메일 → 주 1회 업데이트. 한/영 자동 감지
(locale 태그 기반).

### 3. 추천 코드 (ref)
Waitlist 가입 시 `?ref=xxx` 파라미터 저장. "친구 초대" 루프 가능.

### 4. Cron: 주간 Build-in-Public 자동 다이제스트
매주 금요일 `stats:total-brands`, `waitlist:*` 카운트 집계 → 네 이메일로
자동 발송. 수동 Twitter 포스트 작성 부담 줄임.

### 5. 다국어 sitemap
`sitemap.ts` 에 locale별 엔트리 자동 생성.

---

## 🗓️ 창업자 실행 체크리스트 (자동화 불가)

| Week | 한국 | 글로벌 |
|------|------|------|
| 1 | 디스퀘어 계정 + 첫 포스트 | Twitter + LinkedIn 계정 |
| 2 | 네이버 카페 3곳 진입 | 블로그/뉴스레터 첫 글 |
| 3 | 오픈카톡방 DM 20건 | Indie Hackers launch |
| 4 | 네이버 광고 7일 테스트 | r/SideProject |
| 5 | Meta 광고 7일 테스트 | Dribbble/Slack 침투 |
| 6 | PH Korea 런치 | Weekly Challenge 시작 |
| 7 | 한국 유튜버 아웃리치 | Apple editorial pitch |
| 8 | 한글 로고 베타 발표 | BetaList 제출 |
| 9 | 토스 블로그 인터뷰 제안 | PH global 런치 준비 |
| 10 | 한국 SMB mockup 베타 | PH global 런치 D-Day |
| 11 | 데이터 기반 A/B 아이디어 반복 | YouTube long-form 촬영 |
| 12 | 전환 최적화 상시 | 다음 분기 로드맵 수립 |

---

## 📊 측정 대시보드 (추적 필수)

Vercel Analytics 이벤트:
- `waitlist_signup` (locale=ko|en, ref=?)
- `brand_new_start`
- `brand_save_success` / `_fail`
- `paid_checkout_start` (plan, surface)

UTM 파라미터 convention:
- `utm_source`: disquiet / twitter / ig / naver-cafe / okt / producthunt / reddit / ads-naver / ads-meta / dribbble
- `utm_medium`: post / dm / ad / comment / launch / newsletter
- `utm_campaign`: mvp-apr / kor-launch / ph-may / editorial-pitch

---

## ⚠️ 리스크 + 완화책

| 리스크 | 완화 |
|-------|------|
| Apple editorial 놓침 | BetaList / Product Hunt + 유료광고 backup |
| Recraft API 비용 폭발 | Rate limit 이미 티어별 캡 적용, 주간 모니터 |
| 경쟁사 (Canva) 한글 로고 먼저 잡음 | Weekly Challenge + 커뮤니티 lock-in으로 retention |
| Korea 시장 작게 뜸 | 글로벌 병행으로 상쇄, 두 시장 독립적 |
| 창업자 번아웃 | 자동화 최대화, 콘텐츠 달력 + 템플릿으로 분담 |

---

**업데이트**: 매주 금요일 체크. 실제 수치로 가설 검증/폐기. 로드맵은
살아있는 문서.
