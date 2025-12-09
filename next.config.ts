import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'minio.local',
        port: '8443',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // garde ton pattern générique si utile
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000',
  },

  // Optimisations
  compress: true,
  poweredByHeader: false,

  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;