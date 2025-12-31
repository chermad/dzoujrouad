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
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // ⚠️ TypeScript n’est pas encore à jour sur turbo
  experimental: {
    turbo: {
      loaders: {
        ".css": ["postcss-loader"],
      },
    },
  } as any, // 👈 clé magique
};

export default nextConfig;
