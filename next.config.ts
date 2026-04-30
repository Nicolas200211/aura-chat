import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    return config;
  },
};

const finalConfig = withPWA(nextConfig);

// Forzamos la propiedad para que Next.js 16 la vea sí o sí
// @ts-ignore
finalConfig.turbopack = {};

export default finalConfig;
