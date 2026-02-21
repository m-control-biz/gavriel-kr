/**
 * SEO module — keyword data and aggregate metrics.
 * Phase 5. Reuses Metric for seo_clicks / seo_impressions; SeoKeyword for keyword-level.
 */

import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export type SeoKeywordRow = {
  id: string;
  keyword: string;
  impressions: number;
  clicks: number;
  position: number;
  date: Date;
};

export async function listSeoKeywords(filter: {
  tenantId: string;
  clientId?: string | null;
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<SeoKeywordRow[]> {
  const rows = await prisma.seoKeyword.findMany({
    where: {
      tenantId: filter.tenantId,
      ...(filter.clientId ? { clientId: filter.clientId } : {}),
      ...(filter.from || filter.to
        ? {
            date: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: "desc" }, { clicks: "desc" }],
    take: filter.limit ?? 100,
    select: { id: true, keyword: true, impressions: true, clicks: true, position: true, date: true },
  });
  return rows.map((r) => ({
    id: r.id,
    keyword: r.keyword,
    impressions: r.impressions,
    clicks: r.clicks,
    position: typeof r.position === "object" ? Number((r.position as Decimal).toString()) : r.position,
    date: r.date,
  }));
}

export async function createSeoKeyword(data: {
  tenantId: string;
  clientId?: string | null;
  keyword: string;
  impressions: number;
  clicks: number;
  position: number;
  date: Date;
}) {
  const dateOnly = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate());
  return prisma.seoKeyword.create({
    data: {
      tenantId: data.tenantId,
      clientId: data.clientId,
      keyword: data.keyword,
      impressions: data.impressions,
      clicks: data.clicks,
      position: data.position,
      date: dateOnly,
    },
  });
}
