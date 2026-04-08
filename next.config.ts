import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', 'xlsx'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
