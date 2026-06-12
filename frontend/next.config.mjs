/** @type {import('next').NextConfig} */
const nextConfig = {
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
