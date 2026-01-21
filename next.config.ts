import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'docs',
  output: 'export',

  images: {
    unoptimized: true,
  },

  trailingSlash: true,
};

export default nextConfig;
