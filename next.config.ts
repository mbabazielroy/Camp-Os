import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder stock photos for the public website (see lib/site/photos.ts).
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
};

export default nextConfig;
