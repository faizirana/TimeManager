import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',                
        destination: 'http://backend:3000/:path*',
      },
    ];
  },

  telemetry: false,
  reactStrictMode: true,
};

export default nextConfig;
