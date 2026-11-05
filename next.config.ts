import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel detecta Next.js y no requiere output ni runtime personalizados.
  allowedDevOrigins: ["*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // Vercel Blob: <store-id>.public.blob.vercel-storage.com
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
