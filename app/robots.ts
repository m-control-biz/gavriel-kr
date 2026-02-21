import type { MetadataRoute } from "next";

/** Block all crawlers — system must NOT be indexed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
