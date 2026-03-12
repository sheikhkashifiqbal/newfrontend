import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ✅ REQUIRED for Azure Static Web Apps (static hosting)
  // This replaces `next export` and generates the `out/` folder on `next build`
  output: "export",

  // ✅ If you use next/image anywhere, static export requires unoptimized images
  images: {
    unoptimized: true,
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  // Your existing turbopack svg rule (kept)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ⚠️ Redirects are server features; for static export they won't behave like SSR.
  // Keep them commented for now.
  // async redirects() {
  //   return [
  //     {
  //       source: "/",
  //       destination: "/services",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;