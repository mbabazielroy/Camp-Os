import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow the dev server's internal requests when the app is opened
  // from a phone on the LAN or through a forwarded port in a cloud dev
  // environment (GitHub Codespaces, Gitpod). Without these, Next warns about
  // the cross-origin request and will eventually block it.
  allowedDevOrigins: [
    "*.app.github.dev",
    "*.githubpreview.dev",
    "*.gitpod.io",
    "*.gitpod.dev",
  ],
};

export default nextConfig;
