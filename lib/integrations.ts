/**
 * Integrations — per-account external property connections (Google Analytics, GSC, Ads, etc.).
 * Tokens stored encrypted. Sync writes metrics with account_id.
 */

import { prisma } from "@/lib/db";
import { encryptToken, decryptToken } from "@/lib/tokens";

export async function listIntegrations(accountId: string) {
  return prisma.integration.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    select: { id: true, provider: true, name: true, externalPropertyId: true, isActive: true, metadataJson: true, createdAt: true },
  });
}

export async function updateIntegrationMetadata(
  accountId: string,
  id: string,
  meta: { connectionStatus: "ok" | "error" | "unknown"; lastCheckedAt: string; lastError?: string | null },
) {
  return prisma.integration.update({
    where: { id },
    data: { metadataJson: meta as object, isActive: meta.connectionStatus === "ok" },
  });
}

export async function createIntegration(data: {
  accountId: string;
  provider: string;
  externalPropertyId?: string | null;
  name?: string | null;
  credentials?: Record<string, string>;
}) {
  const encrypted = data.credentials ? encryptToken(JSON.stringify(data.credentials)) : null;
  return prisma.integration.create({
    data: {
      accountId: data.accountId,
      provider: data.provider,
      externalPropertyId: data.externalPropertyId ?? null,
      name: data.name ?? null,
      encryptedAccessToken: encrypted,
    },
  });
}

export async function getIntegration(accountId: string, id: string) {
  return prisma.integration.findFirst({ where: { id, accountId } });
}

export async function deleteIntegration(accountId: string, id: string) {
  return prisma.integration.delete({ where: { id } });
}

export function getDecryptedCredentials(integration: { encryptedAccessToken: string | null }) {
  if (!integration.encryptedAccessToken) return null;
  try {
    return JSON.parse(decryptToken(integration.encryptedAccessToken)) as Record<string, string>;
  } catch {
    return null;
  }
}

/** Mock sync: create sample metrics for the last 7 days. Real impl would call Google Ads API. */
export async function syncGoogleAdsMetrics(accountId: string, clientId: string | null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const f = 0.8 + Math.random() * 0.4;
    rows.push(
      { accountId, clientId, metricType: "leads", value: Math.round(15 * f + Math.random() * 20), date, source: "google_ads" },
      { accountId, clientId, metricType: "cpl", value: 25 + Math.random() * 20, date, source: "google_ads" },
      { accountId, clientId, metricType: "spend", value: Math.round((400 + Math.random() * 400) * f * 100) / 100, date, source: "google_ads" },
      { accountId, clientId, metricType: "conversions", value: Math.round(5 * f + Math.random() * 8), date, source: "google_ads" },
      { accountId, clientId, metricType: "roas", value: Math.round((2 + Math.random() * 2.5) * 100) / 100, date, source: "google_ads" }
    );
  }
  await prisma.metric.createMany({ data: rows });
  return rows.length;
}
