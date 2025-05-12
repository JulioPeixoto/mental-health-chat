import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Remova daqui 'serverComponentsExternalPackages'
  },
  // Adicione aqui em vez de dentro de experimental
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
  // Desabilita a normalização de URL para ter mais controle no middleware
  skipMiddlewareUrlNormalize: true,
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  webpack(config) {
    config.externals.push({ 
      'thread-stream': 'commonjs thread-stream', 
      pino: 'commonjs pino' 
    });
    return config;
  },
};

export default nextConfig;
