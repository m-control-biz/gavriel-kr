import type { NextConfig } from "next";

const basePath = process.env.VERCEL === "1" ? "/bina-6" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  async redirects() {
    if (!basePath) return [];
    return [
      {
        source: "/",
        destination: "/bina-6",
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
