import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // basePath: "/crypto-dashboard-nextjs", 
  // assetPrefix: "/crypto-dashboard-nextjs/",
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
      },
    ],
  },
};

export default nextConfig;
