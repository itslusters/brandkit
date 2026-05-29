# BrandKit — Handoff (2026-05-28)

Work moved from Mac mini → MacBook. Everything below reflects state as of this date.
The design specs/plans under `docs/superpowers/` and the assistant's memory were **Mac-mini-local and did NOT transfer** — this file is the canonical handoff. All code is in git (pushed).

## Resume on the MacBook

```bash
cd <brandkit>                      # the existing clone (or re-clone github.com/itslusters/brandkit)
git fetch origin
git checkout main && git pull      # logo Imagen fix is here, and it's what's deployed
git fetch origin feat/viral-funnel-paywall feat/imagen-logos   # the in-progress branches
vercel env pull .env.local         # re-pull secrets (gitignored). vercel CLI logged in as mokkymin-2359
npm install
npm run dev                        # http://localhost:3000
```

Infra facts:
- **GitHub**: `github.com/itslusters/brandkit` (private). Commit identity `layerlab-ai`, repo account `itslusters`.
- **Vercel**: scope `seongils-projects-b0fccc29`, project `brandkit`, prod **https://brandkit-wheat.vercel.app**.
- **TestFlight / iOS**: `capacitor.config.ts` `server.url = brandkit-wheat.vercel.app` → the app **loads production over the network**. So deploying to prod updates TestFlight with no Xcode rebuild (just relaunch the app).
- **Deploy gotcha**: `git push origin main` sometimes leaves the Vercel git auto-build stuck at status UNKNOWN for 20+ min. Workaround that worked twice: `vercel --prod --yes` (CLI deploy). Note the shell has a stale `VERCEL_TOKEN` in `~/.zshenv`-era env on the mini — on the MacBook just ensure `vercel whoami` works; if a command says "token not valid", prefix with `env -u VERCEL_TOKEN`.

## Branch map / deploy status

| Branch | Contains | Deployed to prod? |
|---|---|---|
| `main` | logo industry-coverage fix + **logo → Imagen 4 migration** | ✅ YES (live on brandkit-wheat) |
| `feat/imagen-logos` | (= main; the Imagen logo work was merged into main) | content is in main |
| `feat/viral-funnel-paywall` | **P1 friction-zero funnel** (6 commits) + a cherry-pick of the logo coverage fix | ❌ NO — must NOT ship without P2 |

---

## THREAD A — Image engine: Recraft → Imagen 4 (active)

**Why:** Logos came out the same illustrative style for every industry. Root cause was NOT env/hardcoding — it was Recraft's `style: vector_illustration` parameter overriding the prompt (forcing illustrations + human figures, ignoring "wordmark only"). Fix = generate with **Imagen 4** (`@google/genai`, model `imagen-4.0-generate-001`), which follows the natural-language prompt so per-industry anchors actually change the style.

- ✅ **Logo → Imagen** — DONE & DEPLOYED. New `lib/imagen.ts` (`generateImagenImage`). `buildLogoPrompt` rewritten for Imagen (see gotcha below). `app/api/brand/logo/generate/route.ts` calls Imagen. `postprocessLogo` was already Imagen-era (raster PNG). SVG still via Recraft `vectorizeRecraftImage`. Verified by generating real samples per industry (SaaS=geometric sans, food=humanist serif, fashion=high-contrast serif). Tests: `__tests__/imagen.test.ts`, rewritten `logo-gemini.test.ts`, `logo-route.test.ts`.
- ⬜ **Mood images → Imagen** (Task 13): `lib/recraft.ts` `generateMoodImage` + `app/api/brand/mood/generate/route.ts`. Drop `resolveMoodStyleId` (trained-style env, unused/empty anyway), use a brief+industry natural-language prompt → `generateImagenImage`. Imagen is great for aesthetic mood imagery (`scripts/generate-landing-illustrations.ts` already uses it).
- ⬜ **Mockups → Imagen** (Task 14): `app/api/brand/mockup/generate/route.ts` + `lib/mockups-recraft.ts`. Keep the logo-compositing flow; swap scene generation to Imagen (`scripts/generate-mockup-templates.ts` already uses Imagen 4 as precedent).

**⚠️ Imagen prompt gotcha (critical):** Imagen renders ALL-CAPS directive labels as literal text *inside* the image (e.g. "WORDMARK ONLY" showed up as "TEORDMARK ONLY" in the logo, "FOOD & BEVERAGE IDENTITY" as a caption). When migrating mood/mockup prompts: no shouted labels, strip `industryAnchor`'s "X IDENTITY:" prefix to its descriptive clause, translate hex→color names, and state plainly that the only text is the brand name. See the rewritten `buildLogoPrompt` in `lib/gemini.ts` as the reference pattern.

---

## THREAD B — Viral funnel (Glam Up playbook) — bigger project, paused mid-way

Source: `~/Downloads/From 0 to 1 Million Users...Redacted.pdf` (NOT in repo — it's in Downloads on the mini; re-download/copy if needed). Goal: port the Glam Up growth/monetization model onto BrandKit's iOS app.

**Locked decisions:** full model decomposed into subsystems A+B (funnel+paywall) / C (pricing) / D (referral) / E (TikTok content). iOS-centric · friction-zero (no login in funnel, anonymous + RevenueCat) · hybrid gate (name + watermarked logo free; HD logo + mood + mockups + downloads behind pay-or-refer-3-friends) · funnel = "participate → single blurred reveal cliffhanger → emotional paywall". Dropped Glam Up's forced App-Store-rating nudge (Apple violation) and fake scan (BrandKit generation is real).

- ✅ **P1 — friction-zero foundation** — IMPLEMENTED & verified on `feat/viral-funnel-paywall` (NOT deployed). What it does: middleware opens `/brand/*` + `/api/brand/*` to anonymous users; `lib/anon.ts` (device id + `genFetch` x-anon-id header); `lib/request-identity.ts` (server rate-limit key: userId→anon→IP); all generation routes allow anonymous + rate-limit by that key (existing `getUserTier()` already returns `free` for anon). 7 commits, full test suite green, independent code review APPROVED, end-to-end anon smoke passed.
- ✅ **P2 — entitlement / hybrid gate** — DESIGNED ONLY (not built). Key decisions captured here since the spec file is mini-local:
  - **Anon paid verification = Option A (webhook → Upstash):** set RevenueCat App User ID = our anon id (`lib/iap.ts` currently requires Clerk userId — change to `userId ?? getAnonId()`). Extend `app/api/revenuecat/webhook/route.ts`: if `app_user_id` starts with `user_` → existing Clerk path; else write entitlement to Upstash keyed by anon id (new `lib/anon-entitlement.ts`, mirror `lib/entitlements.ts`). Server gate (`lib/entitlement-check.ts`, new): `getEffectiveTier(req)` = signed-in → `getUserTier()`, else → anon-tier from Upstash; `isUnlocked = tier>free || referralUnlocked`. Client unlocks optimistically from RC `customerInfo` to cover webhook lag.
  - **Logo HD delivery = store-clean-server-side:** at generation, upload the CLEAN logo to Blob (`lib/blob.ts`, keyed by anon id, URL kept server-side), send the client only a watermarked copy (`lib/watermark.ts`); on unlock, a gated route releases the clean URL. (NOTE: this interacts with the Thread-A Imagen migration — reconcile when building.)
  - 6 P2 tasks: anon-entitlement store, webhook anon routing, iap.ts anon identity, entitlement-check + `/api/entitlement`, logo+download gate, `useEntitlement` client hook.
  - ⚠️ **P1 must NOT ship to prod without P2** — otherwise an anonymous user who pays via RevenueCat still gets served free/watermarked assets (server tier check is Clerk-only until P2).
- ⬜ **P3** (blurred brand-reveal card + decision paywall UI), **P4** (3-part social-proof carousel + 50%-off exit discount), **C** (real weekly price values), **D** (referral code tracking — `lib/ref.ts` already captures inbound `?ref=`; outbound/3-invite-unlock not built), **E** (TikTok before/after UGC — marketing ops, non-code).

---

## Open follow-ups
- `app/api/brand/assets/generate` & `app/api/brand/guide/generate`: now public (after P1) and call a paid Recraft API; gated by `requireTier` so anon can't reach it, but an authenticated user has no per-day cap. Add `getLogoLimiter(tier).limit(userId)` (flagged in P1 code review, pre-existing gap).
- Recraft `vectorizeRecraftImage` (SVG) and `RECRAFT_API_KEY` are still in use/needed even after the Imagen migration.
- `RECRAFT_STYLE_ID(S)` / `RECRAFT_MOOD_STYLE_ID(S)` are absent in all Vercel envs — irrelevant after migration, ignore.

## Suggested next step on MacBook
Confirm the logo in TestFlight → finish Thread A (mood + mockup → Imagen on `feat/imagen-logos`, then merge to main + `vercel --prod`) → then return to Thread B (build P2 on `feat/viral-funnel-paywall`).
