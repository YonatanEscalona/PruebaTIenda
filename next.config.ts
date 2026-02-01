import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Configuración para Cloudflare Pages
  experimental: {
    // Necesario para @cloudflare/next-on-pages
  },
};

export default nextConfig;
