/**
 * Metric query abstraction layer.
 * All metric reads go through this module — tenant-scoped, filterable, composable.
 * Phase 5+: extend with additional metricTypes (seo, ads, social).
 */

import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export type MetricType =
  | "leads"
  | "cpl"
  | "spend"
  | "conversions"
  | "roas"
  | "seo_clicks"
  | "seo_impressions"
  | "social_followers"
  | "social_engagement"
  | "social_reach";

export type MetricFilter = {
  tenantId: string;
  clientId?: string | null;
  metricTypes?: MetricType[];
  from: Date;
  to: Date;
  source?: string | null;
};

export type MetricRow = {
  metricType: string;
  value: number;
  date: Date;
  source: string | null;
};

export type KpiSummary = {
  metricType: string;
  current: number;
  previous: number;
  change: number; // percentage change
};

export type ChartPoint = {
  date: string; // ISO date string "YYYY-MM-DD"
  [metricType: string]: number | string;
};

/** Raw metric rows for a given filter. */
export async function queryMetrics(filter: MetricFilter): Promise<MetricRow[]> {
  const rows = await prisma.metric.findMany({
    where: {
      tenantId: filter.tenantId,
      ...(filter.clientId ? { clientId: filter.clientId } : {}),
      ...(filter.metricTypes?.length ? { metricType: { in: filter.metricTypes } } : {}),
      date: { gte: filter.from, lte: filter.to },
      ...(filter.source ? { source: filter.source } : {}),
    },
    select: { metricType: true, value: true, date: true, source: true },
    orderBy: { date: "asc" },
  });
  return rows.map((r) => ({
    metricType: r.metricType,
    value: decimalToNumber(r.value),
    date: r.date,
    source: r.source,
  }));
}

/**
 * KPI summary: sum current period vs. previous period of equal length.
 * Returns % change for each metricType.
 */
export async function queryKpiSummaries(filter: MetricFilter): Promise<KpiSummary[]> {
  const periodMs = filter.to.getTime() - filter.from.getTime();
  const prevFrom = new Date(filter.from.getTime() - periodMs);
  const prevTo = new Date(filter.from.getTime() - 1);

  const [current, previous] = await Promise.all([
    queryMetrics(filter),
    queryMetrics({ ...filter, from: prevFrom, to: prevTo }),
  ]);

  const sum = (rows: MetricRow[], type: string) =>
    rows.filter((r) => r.metricType === type).reduce((a, r) => a + r.value, 0);

  const types = filter.metricTypes ?? ([...new Set(current.map((r) => r.metricType))] as MetricType[]);

  return types.map((type) => {
    const curr = sum(current, type);
    const prev = sum(previous, type);
    const change = prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;
    return { metricType: type, current: curr, previous: prev, change };
  });
}

/**
 * Transform raw rows into chart-ready time-series.
 * Groups by date, one column per metricType.
 */
export function toChartSeries(rows: MetricRow[], types: string[]): ChartPoint[] {
  const byDate: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    const key = toDateKey(row.date);
    if (!byDate[key]) byDate[key] = {};
    byDate[key][row.metricType] = (byDate[key][row.metricType] ?? 0) + row.value;
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => {
      const point: ChartPoint = { date };
      for (const t of types) point[t] = values[t] ?? 0;
      return point;
    });
}

// ——— Helpers ———
function decimalToNumber(d: Decimal | number): number {
  return typeof d === "number" ? d : Number(d.toString());
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Available sources for a tenant (for the source filter dropdown). */
export async function queryAvailableSources(tenantId: string): Promise<string[]> {
  const rows = await prisma.metric.findMany({
    where: { tenantId, source: { not: null } },
    select: { source: true },
    distinct: ["source"],
  });
  return rows.map((r) => r.source!).filter(Boolean);
}
