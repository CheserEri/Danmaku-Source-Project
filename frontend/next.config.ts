import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.bilibili.com',
      },
      {
        protocol: 'https',
        hostname: '*.hdslb.com',
      },
    ],
  },
}

export default nextConfig