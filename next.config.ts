import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages serves exported `.html` routes without a trailing slash.
  trailingSlash: false,
  reactCompiler: true,
};

export default nextConfig;
