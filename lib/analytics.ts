'use client'
import { track } from '@vercel/analytics/react'

/**
 * Thin wrapper around Vercel Analytics' track() so events have a single
 * typed source of truth. All funnel events should go through here so the
 * dashboard stays consistent — add new events here, never call track()
 * directly from components.
 */

type AnalyticsProps = Record<string, string | number | boolean | null>

type EventName =
  | 'waitlist_signup'
  | 'brand_new_start'
  | 'brand_brief_ready'
  | 'brand_naming_picked'
  | 'brand_logo_picked'
  | 'brand_mockup_generate_attempt'
  | 'brand_mockup_generate_success'
  | 'brand_mockup_generate_fail'
  | 'brand_save_success'
  | 'brand_save_fail'
  | 'brand_logo_download'
  | 'paid_checkout_start'
  | 'upgrade_modal_opened'
  | 'upgrade_modal_plan_clicked'
  | 'share_toggle_enabled'
  | 'share_link_copied'

export function trackEvent(name: EventName, props?: AnalyticsProps): void {
  try {
    track(name, props ?? {})
  } catch {
    // Fail-soft — analytics must never break the app
  }
}
