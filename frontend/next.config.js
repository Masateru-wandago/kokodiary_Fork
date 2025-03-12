/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      // Exclude the /api/og route from being rewritten to the backend
      {
        source: '/api/og/:path*',
        destination: '/api/og/:path*',
      },
      // Rewrite all other API routes to the backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
