/** @type {import('next').NextConfig} */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  // iOS/Android build için: CAPACITOR_BUILD=true (static export, API'siz)
  // Vercel (web) için: normal build (API route'lar çalışır)
  ...(isCapacitorBuild ? { output: 'export', distDir: 'dist' } : {}),
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Capacitor build'de API route'larını ve server component'ları exclude et
  ...(isCapacitorBuild ? {
    experimental: {
      // API ve server-only sayfaları hariç tut
    }
  } : {}),
};

module.exports = nextConfig;
