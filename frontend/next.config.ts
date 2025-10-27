import { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Set the root directory for Next.js to the workspace root
      root: path.resolve(__dirname, ".."),
    },
  },
};

export default nextConfig;
