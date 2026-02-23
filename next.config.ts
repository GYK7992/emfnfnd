import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase 스토리지에서 이미지를 불러올 수 있게 허용해요
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
