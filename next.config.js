/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
  // Skip static generation for API routes
  output: 'standalone',
}

module.exports = nextConfig
