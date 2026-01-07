import { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Set the root directory for Next.js to the workspace root
      root: path.resolve(__dirname, ".."),
    },
  },
  /**
   * Security headers to protect against common web vulnerabilities
   * - CSP: Content Security Policy to prevent XSS attacks
   * - X-Frame-Options: Prevent clickjacking attacks
   * - X-Content-Type-Options: Prevent MIME-sniffing
   * - Referrer-Policy: Control referrer information
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "font-src 'self' data:; " +
              "connect-src 'self';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
