/**
 * In-App Purchase bridge — iOS only.
 *
 * Uses RevenueCat as the StoreKit wrapper: it handles the native receipts,
 * subscription lifecycle, and critically, ships a server webhook that we can
 * use to update Clerk `publicMetadata.tier` without trusting client state.
 *
 * Product layout (configured in App Store Connect + mirrored in RevenueCat):
 *   - Non-consumable `kiln.essentials.onetime` → `essentials` entitlement
 *   - Non-consumable `kiln.pro.onetime`        → `pro` entitlement
 *
 * On web this module is a set of no-ops so the pricing page can import it
 * unconditionally without polluting the browser bundle with native SDK code.
 */

import { isNative } from './native'
import type { PaidPlan } from './tier'

let initialized = false

async function ensureInitialized(userId: string): Promise<boolean> {
  if (!isNative()) return false
  if (initialized) return true
  const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_IOS_KEY
  if (!apiKey) {
    console.error('[iap] NEXT_PUBLIC_REVENUECAT_IOS_KEY is not set — IAP disabled')
    return false
  }
  try {
    const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor')
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN })
    await Purchases.configure({ apiKey, appUserID: userId })
    initialized = true
    return true
  } catch (err) {
    console.error('[iap] configure failed:', err)
    return false
  }
}

/**
 * IDs must match what's configured in App Store Connect + RevenueCat.
 * Keep these in sync with the RevenueCat "Entitlements" + "Products" setup.
 */
const PRODUCT_IDS: Record<PaidPlan, string> = {
  essentials: 'kiln.essentials.onetime',
  pro: 'kiln.pro.onetime',
}

/**
 * Launch the native Apple purchase sheet. Returns true if the user completed
 * the purchase (or already owned it) — the RevenueCat webhook then updates
 * Clerk tier server-side.
 *
 * On web this is a no-op returning false; callers should fall back to the
 * Stripe checkout path.
 */
export async function startIapPurchase(plan: PaidPlan, userId: string): Promise<boolean> {
  if (!isNative()) return false
  if (!userId) return false
  if (!(await ensureInitialized(userId))) return false

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const products = await Purchases.getProducts({ productIdentifiers: [PRODUCT_IDS[plan]] })
    const product = products.products?.[0]
    if (!product) {
      console.error('[iap] product not found:', PRODUCT_IDS[plan])
      return false
    }
    const result = await Purchases.purchaseStoreProduct({ product })
    const entitlements = result?.customerInfo?.entitlements?.active ?? {}
    return plan in entitlements || Object.keys(entitlements).length > 0
  } catch (err) {
    // User cancellation surfaces as a thrown error in RevenueCat — swallow.
    const message = err instanceof Error ? err.message : String(err)
    if (/cancel/i.test(message)) return false
    console.error('[iap] purchase failed:', err)
    return false
  }
}

/**
 * "Restore purchases" — required by Apple for any IAP-enabled app. Re-syncs
 * entitlements from the App Store to RevenueCat, which fires the webhook
 * again if anything new was discovered.
 */
export async function restorePurchases(userId: string): Promise<boolean> {
  if (!isNative()) return false
  if (!(await ensureInitialized(userId))) return false
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    const info = await Purchases.restorePurchases()
    return Object.keys(info?.customerInfo?.entitlements?.active ?? {}).length > 0
  } catch (err) {
    console.error('[iap] restore failed:', err)
    return false
  }
}

