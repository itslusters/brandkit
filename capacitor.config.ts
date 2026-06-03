import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor config — wraps the hosted Atriium web app in a native iOS shell.
 *
 * Strategy: `server.url` points to production, so the native app loads the
 * full Next.js experience over the network but gets iOS-native capabilities
 * (haptics, share sheet, filesystem) via Capacitor plugins. This sidesteps
 * the constraints of pure static export (Clerk, API routes, etc. keep working)
 * while still justifying App Store Guideline 4.2 ("Minimum Functionality").
 *
 * When building for release, toggle `server.url` to undefined so the app
 * uses the bundled `webDir` instead — required for offline shell.
 */
const config: CapacitorConfig = {
  appId: 'app.aatrium',
  appName: 'Atriium',
  webDir: 'out',
  server: {
    // Primary domain. Must match the Clerk production instance (clerk.atriium.xyz)
    // — Clerk production is locked to this domain, so loading the shell from the
    // old *.vercel.app origin would break auth (domain mismatch).
    url: 'https://atriium.xyz',
    cleartext: false,
    // Allow the App Store-bound shell to talk to our app + Clerk (prod) + Blob.
    allowNavigation: [
      'atriium.xyz',
      '*.atriium.xyz', // clerk.atriium.xyz, accounts.atriium.xyz (Clerk prod)
      '*.vercel.app',
      '*.vercel.com',
      '*.vercel-storage.com', // Vercel Blob image origins
      'clerk.com',
      '*.clerk.com',
    ],
  },
  ios: {
    // `never`: the web app owns safe-area insets via CSS env(safe-area-inset-*)
    // (e.g. GlassHeader's pt-[env(safe-area-inset-top)]). With the previous
    // `always`, WKWebView ALSO inset the content for the safe area, double-
    // counting it and opening a gap above the sticky header on scroll.
    contentInset: 'never',
    backgroundColor: '#09090b',
    scheme: 'Atriium',
    // Disable scroll bounce so the app feels more native.
    scrollEnabled: true,
  },
  plugins: {
    Camera: {
      // Usage strings live in Info.plist (NSCameraUsageDescription etc).
      // Keeping the plugin key here so cap sync picks it up for iOS.
    },
  },
}

export default config
