/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit reads .afm font files at runtime via dynamic paths — Next.js/Vercel
  // tracing misses these unless explicitly included in the serverless bundle.
  outputFileTracingIncludes: {
    '/api/brand/guide/generate': ['./node_modules/pdfkit/js/data/**/*'],
    '/api/brand/assets/generate': ['./node_modules/pdfkit/js/data/**/*'],
  },
  // Keep sharp out of the bundle — it's a native addon loaded at runtime
  serverExternalPackages: ['sharp', 'pdfkit'],
}

export default nextConfig
