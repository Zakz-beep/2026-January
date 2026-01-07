import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Mengizinkan semua domain HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // Mengizinkan semua domain HTTP
      },
    ],
  },
};

export default nextConfig;