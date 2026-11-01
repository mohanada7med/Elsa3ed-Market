const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ['mongodb', 'bcryptjs', 'express', 'cookie-parser', 'cloudinary', 'multer'],
  allowedDevOrigins: [
    '192.168.1.3',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '192.168.1.3:*',
    'localhost:*',
    '127.0.0.1:*',
    '0.0.0.0:*',
    '*.run.app',
    '*.run.app:*',
    '*.google.com',
    '*.google.com:*',
  ],
  images: {
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    const commonHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(self), geolocation=()',
      },
    ];

    const immutableAssetHeaders = [
      ...commonHeaders,
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ];

    const serviceWorkerHeaders = [
      ...commonHeaders,
      {
        key: 'Cache-Control',
        value: 'public, max-age=0, must-revalidate',
      },
      {
        key: 'Service-Worker-Allowed',
        value: '/',
      },
    ];

    return [
      {
        source: '/((?!_next|mascot|pattern|fonts|audio|uploads|sw\\.js|.*\\.(?:ico|png|jpg|jpeg|svg|webp|avif|gif)).*)',
        headers: [
          ...commonHeaders,
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: serviceWorkerHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: immutableAssetHeaders,
      },
      {
        source: '/_next/image/:path*',
        headers: immutableAssetHeaders,
      },
      {
        source: '/mascot/:path*',
        headers: immutableAssetHeaders,
      },
      {
        source: '/pattern/:path*',
        headers: immutableAssetHeaders,
      },
      {
        source: '/fonts/:path*',
        headers: immutableAssetHeaders,
      },
      {
        source: '/audio/:path*',
        headers: immutableAssetHeaders,
      },
      {
        source: '/:file(.*\\.(?:ico|png|jpg|jpeg|svg|webp|avif|gif))',
        headers: immutableAssetHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
