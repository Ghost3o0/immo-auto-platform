/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip prerendering errors for dynamic routes using useSearchParams
  skipDynamicErrorDiskRevalidate: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
