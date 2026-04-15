import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg':      'var(--brand-bg)',
        'brand-surface': 'var(--brand-surface)',
        'brand-border':  'var(--brand-border)',
        'brand-text':    'var(--brand-text)',
        'brand-muted':   'var(--brand-muted)',
      },
    },
  },
  plugins: [],
};
export default config;
