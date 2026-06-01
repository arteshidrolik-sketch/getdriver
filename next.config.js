/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️  output: 'export' KULLANMA! API route'ları öldürür.
  // iOS/Android build için: npm run build:mobile (ayrı config kullanır)
  ...(process.env.CAPACITOR_BUILD === 'true' ? { output: 'export', distDir: 'dist' } : {}),
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
