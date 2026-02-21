/**
 * Integration providers: map provider id → label, description, and which menu section they power.
 */

export const INTEGRATION_PROVIDERS = {
  google_ads: {
    label: "Google Ads",
    description: "Import campaigns, spend, conversions, and ROAS.",
    section: "dashboard" as const,
    available: true,
  },
  google_analytics: {
    label: "Google Analytics",
    description: "Web traffic and behavior per property. Connect one per account.",
    section: "account" as const,
    available: true,
  },
  gsc: {
    label: "Google Search Console",
    description: "Search performance, queries, and keyword data for SEO.",
    section: "seo" as const,
    available: true,
  },
  meta_social: {
    label: "Meta (Facebook & Instagram)",
    description: "Followers, engagement, and reach from Facebook and Instagram.",
    section: "social" as const,
    available: false, // coming soon
  },
  linkedin_social: {
    label: "LinkedIn",
    description: "LinkedIn page followers and engagement.",
    section: "social" as const,
    available: false,
  },
} as const;

export type ProviderId = keyof typeof INTEGRATION_PROVIDERS;

export function getProvider(id: string) {
  return INTEGRATION_PROVIDERS[id as ProviderId] ?? { label: id, description: "", section: "dashboard", available: false };
}

export function getProvidersForSection(section: "dashboard" | "account" | "seo" | "social") {
  return Object.entries(INTEGRATION_PROVIDERS)
    .filter(([, p]) => p.section === section)
    .map(([id, p]) => ({ id, ...p }));
}
