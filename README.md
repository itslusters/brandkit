# BrandKit

AI branding engine — naming, logo, mockups in minutes.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Framer Motion (animations), Lucide React (icons)
- Supabase (auth + DB), RevenueCat + Apple IAP (payments) — MVP-2
- Claude API (naming + style brief), Gemini Image API (logo) — MVP-2

## Local Dev

npm install
npm run dev        # http://localhost:3000

## Tests

npm run test:run   # vitest one-shot
npm test           # vitest watch mode

## Flow

/ → /brand/new       Step 1: onboarding form
     ↓ submit
  /brand/processing  Step 2: AI streaming (demo in MVP-1, real API in MVP-2)

## Architecture

Mobile-first (max-w-md centered). Dark theme only.
Form state: sessionStorage (survives navigation, cleared on brand confirm).
Animations: Framer Motion layout + AnimatePresence everywhere.
