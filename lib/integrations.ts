/**
 * Integrations — connect external accounts (Google Ads, Search Console, etc.).
 * Credentials stored encrypted. Sync jobs write into Metric table.
 */

import { prisma } from "@/lib/db";
import { encryptToken, decryptToken } from "@/lib/tokens";

export async function listIntegrations(tenantId: string) {
  return prisma.integration.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, name: true, clientId: true, isActive: true, createdAt: true },
  });
}

export async function createIntegration(data: {
  tenantId: string;
  clientId?: string | null;
  type: string;
  name: string;
  credentials: Record<string, string>;
}) {
  const encrypted = encryptToken(JSON.stringify(data.credentials));
  return prisma.integration.create({
    data: {
      tenantId: data.tenantId,
      clientId: data.clientId,
      type: data.type,
      name: data.name,
      encryptedCredentials: encrypted,
    },
  });
}

export async function getIntegration(tenantId: string, id: string) {
  return prisma.integration.findFirst({ where: { id, tenantId } });
}

export async function deleteIntegration(tenantId: string, id: string) {
  return prisma.integration.delete({ where: { id } });
}

export function getDecryptedCredentials(integration: { encryptedCredentials: string | null }) {
  if (!integration.encryptedCredentials) return null;
  try {
    return JSON.parse(decryptToken(integration.encryptedCredentials)) as Record<string, string>;
  } catch {
    return null;
  }
}

/** Mock sync: create sample metrics for the last 7 days. Real impl would call Google Ads API. */
export async function syncGoogleAdsMetrics(tenantId: string, clientId: string | null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const f = 0.8 + Math.random() * 0.4;
    rows.push(
      { tenantId, clientId, metricType: "leads", value: Math.round(15 * f + Math.random() * 20), date, source: "google_ads" },
      { tenantId, clientId, metricType: "cpl", value: 25 + Math.random() * 20, date, source: "google_ads" },
      { tenantId, clientId, metricType: "spend", value: Math.round((400 + Math.random() * 400) * f * 100) / 100, date, source: "google_ads" },
      { tenantId, clientId, metricType: "conversions", value: Math.round(5 * f + Math.random() * 8), date, source: "google_ads" },
      { tenantId, clientId, metricType: "roas", value: Math.round((2 + Math.random() * 2.5) * 100) / 100, date, source: "google_ads" }
    );
  }
  await prisma.metric.createMany({ data: rows });
  return rows.length;
}
