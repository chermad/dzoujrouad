import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.canalblog.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // 🚫 Désactiver Turbopack en production (clé de la stabilité)
  experimental: {
    turbo: false,
  } as any,
};

export default nextConfig;
