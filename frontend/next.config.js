/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      // Exclude the /api/og route from being rewritten to the backend
      {
        source: '/api/og',
        destination: '/api/og',
      },
      // Rewrite all other API routes to the backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
        has: [
          {
            type: 'header',
            key: 'host',
            value: '(?!og)',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
