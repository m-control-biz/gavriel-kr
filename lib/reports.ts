/**
 * Report service layer.
 * Handles CRUD, data hydration, CSV export, and share-token generation.
 * Reuses the metrics abstraction layer for all data queries.
 */

import { prisma } from "@/lib/db";
import { queryMetrics, queryKpiSummaries, toChartSeries, MetricType } from "@/lib/metrics";
import { dateRangeFromParam } from "@/lib/date-utils";
import crypto from "crypto";

// ——— Types ———

export type ReportInput = {
  name: string;
  description?: string;
  clientId?: string;
  metricTypes: MetricType[];
  dateRange: string;
  dateFrom?: string;
  dateTo?: string;
  breakdown: "daily" | "weekly" | "monthly";
  source?: string;
};

export type ReportData = {
  kpis: Awaited<ReturnType<typeof queryKpiSummaries>>;
  chart: ReturnType<typeof toChartSeries>;
  breakdown: "daily" | "weekly" | "monthly";
  metricTypes: MetricType[];
  from: Date;
  to: Date;
};

// ——— CRUD ———

export async function createReport(accountId: string, input: ReportInput) {
  return prisma.report.create({
    data: {
      accountId,
      name: input.name,
      description: input.description,
      clientId: input.clientId ?? null,
      metricTypes: input.metricTypes,
      dateRange: input.dateRange,
      dateFrom: input.dateFrom ? new Date(input.dateFrom) : null,
      dateTo: input.dateTo ? new Date(input.dateTo) : null,
      breakdown: input.breakdown,
      source: input.source ?? null,
    },
  });
}

export async function listReports(accountId: string) {
  return prisma.report.findMany({
    where: { accountId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      metricTypes: true,
      dateRange: true,
      breakdown: true,
      shareToken: true,
      shareExpiry: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getReport(accountId: string, id: string) {
  return prisma.report.findFirst({ where: { id, accountId } });
}

export async function updateReport(accountId: string, id: string, input: Partial<ReportInput>) {
  return prisma.report.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.clientId !== undefined ? { clientId: input.clientId } : {}),
      ...(input.metricTypes !== undefined ? { metricTypes: input.metricTypes } : {}),
      ...(input.dateRange !== undefined ? { dateRange: input.dateRange } : {}),
      ...(input.dateFrom !== undefined ? { dateFrom: new Date(input.dateFrom) } : {}),
      ...(input.dateTo !== undefined ? { dateTo: new Date(input.dateTo) } : {}),
      ...(input.breakdown !== undefined ? { breakdown: input.breakdown } : {}),
      ...(input.source !== undefined ? { source: input.source } : {}),
    },
  });
}

export async function deleteReport(accountId: string, id: string) {
  return prisma.report.delete({ where: { id } });
}

// ——— Share token ———

export async function generateShareToken(accountId: string, id: string, expiryDays = 30) {
  const token = crypto.randomBytes(32).toString("hex");
  const shareExpiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  return prisma.report.update({
    where: { id },
    data: { shareToken: token, shareExpiry },
  });
}

export async function revokeShareToken(accountId: string, id: string) {
  return prisma.report.update({
    where: { id },
    data: { shareToken: null, shareExpiry: null },
  });
}

export async function getReportByShareToken(token: string) {
  const report = await prisma.report.findFirst({
    where: { shareToken: token },
  });
  if (!report) return null;
  if (report.shareExpiry && report.shareExpiry < new Date()) return null; // expired
  return report;
}

// ——— Data hydration ———

export async function hydrateReportData(report: {
  accountId: string;
  clientId?: string | null;
  metricTypes: string[];
  dateRange: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  breakdown: string;
  source?: string | null;
}): Promise<ReportData> {
  let from: Date;
  let to: Date;

  if (report.dateRange === "custom" && report.dateFrom && report.dateTo) {
    from = report.dateFrom;
    to = report.dateTo;
  } else {
    const range = dateRangeFromParam(report.dateRange);
    from = range.from;
    to = range.to;
  }

  const types = report.metricTypes as MetricType[];
  const filter = {
    accountId: report.accountId,
    clientId: report.clientId,
    metricTypes: types,
    from,
    to,
    source: report.source,
  };

  const [kpis, rows] = await Promise.all([
    queryKpiSummaries(filter),
    queryMetrics(filter),
  ]);

  const chart = toChartSeries(rows, types);

  return {
    kpis,
    chart,
    breakdown: (report.breakdown as "daily" | "weekly" | "monthly") ?? "daily",
    metricTypes: types,
    from,
    to,
  };
}

// ——— CSV export ———

export function reportToCsv(data: ReportData): string {
  const metricCols = data.metricTypes;
  const header = ["date", ...metricCols].join(",");
  const rows = data.chart.map((point) => {
    const cols = [point.date, ...metricCols.map((m) => String(point[m] ?? 0))];
    return cols.join(",");
  });
  return [header, ...rows].join("\n");
}
