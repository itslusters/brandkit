# Launch Channels Playbook — 2026-04-19

Target audience + entry message per channel for the initial Atriium push.
Messages are grounded in `/docs/research/korean-market.md`; no channel
gets a generic "AI 로고를 10분만에" line because three dozen competitors
already say the same thing. Each channel below has a tailored hook.

---

## 🎯 타겟 페르소나 재확인

**Primary**: 멀티채널 일꾼 — 월 $19 반복 사용자
- 스마트스토어 / 쿠팡 셀러 (썸네일 주당 수십 장)
- 인스타 쇼핑몰 (포스트 매일)
- 유튜버 (썸네일 + 인트로)
- 1인 앱 개발자 (App Store 에셋)
- 뉴스레터 작성자 (주간 헤더)

**Secondary**: 일회성 로고 구매자 — 낮은 LTV, 타겟 아님

---

## 1. 디스퀘어 (disquiet.io) — 한국 인디 메이커

**왜**: Atriium의 MVP와 가장 자연스럽게 매칭. 1인 개발자/디자이너가 모여있음. 초기 100~300 가입 동원 가능.

**언제**: Phase 1 — 카피 검증 직후. 한국어 UI 출시 대기하지 않아도 됨 (이 커뮤니티는 영어/한영 혼용 허용).

**엔트리 메시지** (MAKERS 카테고리 포스트):
```
[MVP] Atriium — 로고 한 번 만들면 썸네일, 앱 아이콘, 상세페이지까지 자동 변환

만든 배경:
- 5월에 iOS 앱 출시 앞두고 로고/아이콘 에셋 셋업하다가 빡쳐서 시작
- 크몽/Canva 모두 한 번 쓰고 끝나는 툴. 매달 에셋 새로 찍어내야 하는 1인 개발자한테 안 맞음
- 로고 1개 → 모든 채널 규격 자동 변환 + 벡터 SVG + 상업적 사용권이 기본

지금 Free 티어로 브리프 / 로고 3개 / A/B 폴까지 가능.
Studio ($79/mo)에 실제 디자이너가 월 1회 손봐줌.

피드백 받고 싶은 것:
- "3개 변형 중 1개는 반드시 쓸만하다" 기준선 통과하는지
- 멀티채널 자동 변환 개념이 본인 워크플로우에 와닿는지

링크: https://brandkit-wheat.vercel.app
```

**팔로업**: 댓글 달린 유저한테 30분 내 답. 실제 브랜드 만들어보게 하고 즉시 DM.

---

## 2. Twitter / Threads — Build in Public

**왜**: Flighty 공식. 창업자 brand + 지속적 콘텐츠로 팔로워 → 론칭 대기열.

**포스팅 주기**: 매일 1개 (최소 90일)

**콘텐츠 유형 mix**:

### A. 진행 업데이트 (주 2회)
```
Atriium v0.12 — 한국어 로고 베타 붙이는 중.
Recraft V3가 한글을 잘 못 렌더링해서 satori + Pretendard로 클라이언트 렌더링으로 우회 중.
시간 얼마 걸리든 이게 맞다고 봄.
[스크린샷]
```

### B. 결정 공개 (주 1회)
```
Atriium 유료 티어를 어떻게 설계할지 고민 끝에 이렇게 갔다:
- Essentials $29 원샷 — 일회성 구매자
- Solo $19/mo — 반복 사용자 (멀티채널 일꾼)
- Studio $79/mo — 월 1회 디자이너 터치
왜 Solo가 제일 팔릴 걸로 예상하느냐면 [thread]
```

### C. 숫자 공유 (주 1회)
```
Week 3:
- Waitlist: 234명
- 베타 유저: 18명
- 생성된 브랜드: 47개
- Churn: 0 (아직 결제 안 받음)
피드백 테마: "썸네일 자동화가 제일 쓸만함" (7명)
```

### D. 실수/실패 공유 (주 1회)
```
오늘 실수: Recraft 프롬프트에 브랜드 이름을 그대로 박았더니 영문 렌더링이 꼬임.
"Hearthside" → 생성된 이미지엔 "HeartSider" 처럼 스펠 깨짐.
해결: 짧은 브랜드 이름만 렌더링, 5자 넘으면 명칭 blur 처리.
```

**해시태그**: `#buildinpublic` `#indiehacker` `#디자인AI` `#인디해커` `#sidehustle`

---

## 3. 네이버 카페 — 소상공인 / 창업 커뮤니티

**왜**: 45만~12만 규모의 타겟 커뮤니티 존재. 광고성 포스트는 막히지만 "내가 이런 툴 만들고 있어요" 식은 허용되는 카페 다수.

**타겟 카페**:
- **창업공감** (45만명) — 창업 전후 Q&A
- **인스타마켓 정보공유** (12만명) — 인스타 셀러 전용
- **디자인 아카데미** (8만명) — 디자이너 + 구매자 혼재

**엔트리 메시지 (창업공감)**:
```
[1인 창업자용 브랜드 자동화 툴 베타 테스터 모집]

5개월째 1인 앱 서비스 만들면서 로고/썸네일/배너 매일 찍어내는 게 너무 힘들어서
직접 만든 툴 베타 테스터 모집합니다.

- 브랜드명/산업만 입력하면 로고 + 팔레트 + 9개 채널별 목업 자동 생성
- 크몽에서 15만원 주고 받던 결과물 수준을 목표로
- 베타 참여하시면 3개월 무료 (정식 오픈 후 월 2만5천원 예정)

필요한 분:
- 스마트스토어/쿠팡/인스타 운영자
- 매주 새 썸네일 찍어야 하는 분
- 유튜브 채널 브랜드 일관성 필요한 분

관심 있으시면 댓글 or 쪽지 주세요.
```

**주의**:
- 카페 규칙 확인, 광고 카테고리 있으면 거기로
- 댓글 수시 체크 (카페는 게시판 실시간 이동 빠름)
- 직접 DM 유도 (네이버 쪽지)

---

## 4. 오픈카톡방 — 실시간 타겟 접근

**왜**: 광고 극도로 어렵지만 **실시간 문답 가능**. 이미 "1인 창업", "스마트스토어 노하우" 주제로 500~1,000명 규모 방 많음.

**접근 방식**: 룰 지키면서 **질문으로 시작**. 오픈카톡방은 일방 광고 금지가 기본.

**진입 메시지 (관찰형)**:
```
처음 인사드려요! 1인 앱 개발자입니다.
요새 SMB 대상 브랜드 자동화 툴 만들고 있는데, 실제 스토어 운영하시는 분들한테
하나 여쭙고 싶은 게 있어서요.

썸네일이나 배너 같은 거 매주 몇 개나 새로 만드세요?
그리고 지금 그거 어떻게 만드시는지 (미리캔버스, 외주, 직접...)?

실사용자 인사이트 수집 중이라 답변 주시면 나중에 만든 툴 무료로 써보실 수 있게 해드릴게요.
```

**포인트**: 답변받은 사람 DM으로 follow-up → 개별 베타 초대.

---

## 5. Product Hunt / Product Hunt Korea

**왜**: 론칭 하루 동안 1000~3000명 방문 가능. SEO에도 도움.

**언제**: waitlist 500명 이상 모인 이후. 최소 3개월 후.

**런치 전 체크리스트**:
- [ ] 200명 이상 기존 Product Hunt 팔로워 (안 해본 사람은 모으기 어려움 → 지인 20명 hunter로 등록시켜라)
- [ ] 깨끗한 2-minute demo video
- [ ] 5 sequential screenshots (feature별)
- [ ] 48시간 전 hunter 지정 + launch 예약
- [ ] launch day 모든 소셜 채널에 upvote 요청 (waitlist 이메일 포함)

**런치 후킹**:
```
Atriium — The brand workspace for one-person operations.

TL;DR: Pick a brand direction, get a logo + 9 channel-specific mockups
(smart store thumbnail, Instagram post, YouTube thumbnail, app icon…)
auto-generated with the same DNA. Vector SVG included. $19/mo.

Why I built it: I'm a solo dev launching an iOS app. Every week I
spend 5 hours in Canva resizing the same brand for 4 different
platforms. Atriium does all 4 in one generate.

Free tier gives you the brief, logo variants, and a clean PNG to keep.
```

---

## 6. Indie Hackers / Reddit

**r/SideProject**: launch thread 스타일, 허용적. 좋은 첫 launch.

**r/startups**: 좀 더 엄격. "product review" 플레어로 자제되게 올릴 것.

**IndieHackers.com**: 유료화 스토리 중심. "How I priced Atriium's free/Solo/Studio tiers" 같은 글로 진입.

**공통 포맷**:
```
🚀 Atriium — MVP launched, feedback welcome

What: Brand workspace for one-person operations
Who: Smart-store sellers, solo developers, YouTubers, newsletter writers
Why different: Single brand → 9 channel-specific mockups. Vector SVG +
commercial rights on paid tiers. Designer handoff on Pro/Studio.

Tech: Next.js 14, Clerk, Capacitor iOS, Recraft V3, Vercel Blob
Current: Free tier works, paid tiers wired to Apple IAP (setup in progress)
Looking for: feedback on the Free → Solo conversion copy + ideas on
Korean market adaptation.

Link: https://brandkit-wheat.vercel.app
```

---

## 7. 유료 테스트 — 소액부터

### 네이버 검색 광고
- 키워드: "로고 제작", "브랜드 만들기", "스마트스토어 썸네일"
- 예산: 일 5,000원부터 7일 테스트
- CPC 예상: 1,000~3,000원
- 목표: CAC 측정 (signup 1명 당 얼마)

### 페이스북/인스타그램 광고
- 타겟: 25~45세, 관심사 "소상공인/전자상거래/개인사업자/디자인"
- 크리에이티브: 10초 시연 영상 (Atriium 브랜드 생성 과정)
- 예산: 일 $5~10
- 목표: CTR + landing → waitlist

---

## 8. 측정 대시보드 (최소)

모든 채널에서 utm parameter 강제:
- `utm_source`: disquiet / twitter / naver-cafe / okt / producthunt / reddit / ads_naver / ads_meta
- `utm_medium`: post / ad / comment / dm / launch
- `utm_campaign`: mvp-apr / launch-kor-may / ph-jun

Vercel Analytics에서 utm 별 conversion 파악 (waitlist signup, save brand, paid click).

---

## 채널별 기대값

| 채널 | 예상 트래픽 | 예상 전환율 (waitlist) | 예산/시간 |
|------|-----------|---------------------|---------|
| 디스퀘어 | 500 | 15% | 3시간 |
| Twitter (90일) | 2,000~5,000 | 5% | 매일 30분 × 90 |
| 네이버 카페 | 300~1,000 | 10% | 1시간 × 3 카페 |
| 오픈카톡방 | 100 | 30% (대화형) | 매일 1시간 × 2주 |
| Product Hunt | 3,000 | 10% | 2일 준비 |
| IndieHackers | 500 | 8% | 1시간 |
| 네이버 광고 (7일) | 1,000 | 3% | 35,000원 |
| 메타 광고 (7일) | 1,500 | 2% | $70 |

**예상 90일 waitlist 총합**: 2,500~5,000명. Product Hunt 론칭 기준 전환 기대치 8~15%.

---

## 실행 순서

**Week 1**: 디스퀘어 + Twitter 계정 + 첫 3개 포스트
**Week 2**: 네이버 카페 3곳 진입 + 오픈카톡방 리서치
**Week 3**: 네이버 광고 소액 테스트
**Week 4**: Indie Hackers story + r/SideProject
**Week 5-12**: Twitter 지속 + 카페 follow-up + 메타 광고
**Week 13**: Product Hunt 론칭 (waitlist 500+ 기준)

---

**업데이트**: 채널별 실제 CAC / 전환율이 확인되면 이 문서에 반영. 가설로 남아있는 수치는 실데이터로 교체.
