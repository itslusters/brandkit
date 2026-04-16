/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next 14.2 still has this under `experimental` (renamed to `serverExternalPackages` in 15).
    // Marking these as external means Next won't bundle them — at runtime they're required
    // straight from node_modules, so __dirname resolves correctly and pdfkit can find its
    // .afm font files at node_modules/pdfkit/js/data/.
    serverComponentsExternalPackages: ['sharp', 'pdfkit'],
  },
}

export default nextConfig
