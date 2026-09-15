import type { NextConfig } from "next";

const IMINTERVIEW_ORIGIN =
  process.env.IMINTERVIEW_ORIGIN || "https://iminterview.vercel.app";
const BINA6_ORIGIN = process.env.BINA6_ORIGIN || "https://bina-6.vercel.app";
// AEAI newsletters are published from the separate AEAINewsletter repo.
const NEWSLETTER_ORIGIN =
  process.env.NEWSLETTER_ORIGIN || "https://aeai-newsletter.vercel.app";

const nextConfig: NextConfig = {
  // Security: prevent indexing
  async headers() {
    return [
      {
        source: "/bina-6",
        headers: [
          { key: "X-Robots-Tag", value: "index, follow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/bina-6/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "index, follow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/((?!bina-6(?:/|$)).*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles runs ahead of public/, so newsletter URLs are served by
      // the AEAINewsletter project even though the old copies in
      // public/newsletter are still present. Removing this block restores
      // serving from public/newsletter.
      beforeFiles: [
        {
          source: "/newsletter/:path*",
          destination: `${NEWSLETTER_ORIGIN}/newsletter/:path*`,
        },
      ],
      afterFiles: [
        {
          source: "/iminterview",
          destination: `${IMINTERVIEW_ORIGIN}/iminterview`,
        },
        {
          source: "/iminterview/:path*",
          destination: `${IMINTERVIEW_ORIGIN}/iminterview/:path*`,
        },
        {
          source: "/bina-6",
          destination: `${BINA6_ORIGIN}/bina-6`,
        },
        {
          source: "/bina-6/:path*",
          destination: `${BINA6_ORIGIN}/bina-6/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
