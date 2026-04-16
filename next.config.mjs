/** @type {import('next').NextConfig} */
const nextConfig = {
  // sharp is a native addon — loaded from node_modules at runtime, not bundled
  serverExternalPackages: ['sharp'],
}

export default nextConfig
