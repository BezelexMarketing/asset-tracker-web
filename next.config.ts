import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static export temporarily to allow regular build
  // output: 'export',
  // trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
