import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_BASE_API: process.env.NEXT_BASE_API,
  },
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    // Enable image optimization for better performance
    unoptimized: false,
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.artiversehub.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/s2/favicons/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.alchemy.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.thegraph.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.quillbot.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'quillbot.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'moralis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dune.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'chatgpt.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'defillama.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static-web.grammarly.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bolt.new',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.phind.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.thum.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image-to-video.moxion.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'runwayml.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lovable.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gamma.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.midjourney.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'copilot.microsoft.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.notion.so',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.notion.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'v0.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'v0.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'grok.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cursor.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'elevenlabs.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.perplexity.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
  productionBrowserSourceMaps: false,
};

export default withNextIntl(nextConfig);
