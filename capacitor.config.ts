import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor config — wraps the hosted Kiln web app in a native iOS shell.
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
  appId: 'app.kiln',
  appName: 'Kiln',
  webDir: 'out',
  server: {
    url: 'https://brandkit-wheat.vercel.app',
    cleartext: false,
    // Allow the App Store-bound shell to talk to our API + Vercel Blob origins.
    allowNavigation: [
      'brandkit-wheat.vercel.app',
      '*.vercel.app',
      '*.vercel.com',
      '*.vercel-storage.com',
      'clerk.com',
      '*.clerk.accounts.dev',
      '*.clerk.com',
    ],
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#09090b',
    scheme: 'Kiln',
    // Disable scroll bounce so the app feels more native.
    scrollEnabled: true,
  },
}

export default config
