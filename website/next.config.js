/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['localhost', 'beze-asset-tracker.com', 'api.beze-asset-tracker.com'],
  },
  // Remove rewrites for static export
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: process.env.NODE_ENV === 'production' 
  //         ? 'https://api.beze-asset-tracker.com/api/:path*'
  //         : 'http://localhost:5000/api/:path*',
  //     },
  //   ];
  // },
  async redirects() {
    return [
      {
        source: '/download/ios',
        destination: process.env.NEXT_PUBLIC_IOS_APP_URL || 'https://apps.apple.com/app/bez-asset-tracker',
        permanent: false,
      },
      {
        source: '/download/android',
        destination: process.env.NEXT_PUBLIC_ANDROID_APP_URL || 'https://play.google.com/store/apps/details?id=com.bezeassettracker.app',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  trailingSlash: false,
};

module.exports = nextConfig;