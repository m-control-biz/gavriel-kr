import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccountScope } from "@/lib/tenant";
import { queryKpiSummaries, queryMetrics, queryAvailableSources, toChartSeries } from "@/lib/metrics";
import { dateRangeFromParam, formatCompact, formatCurrency, formatMultiplier } from "@/lib/date-utils";
import { prisma } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MetricLineChart } from "@/components/dashboard/metric-line-chart";
import { MetricBarChart } from "@/components/dashboard/metric-bar-chart";
import { AlertsList } from "@/components/dashboard/alerts-list";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";

const KPI_META: Record<string, { label: string; format: (n: number) => string; description: string }> = {
  leads:           { label: "Leads",           format: formatCompact,    description: "Total leads in period" },
  cpl:             { label: "Cost per Lead",    format: formatCurrency,   description: "Avg CPL vs previous period" },
  spend:           { label: "Ad Spend",         format: formatCurrency,   description: "Total spend in period" },
  conversions:     { label: "Conversions",      format: formatCompact,    description: "Total conversions in period" },
  roas:            { label: "ROAS",             format: formatMultiplier, description: "Return on ad spend" },
  seo_clicks:      { label: "SEO Clicks",       format: formatCompact,    description: "Organic search clicks" },
  seo_impressions: { label: "SEO Impressions",  format: formatCompact,    description: "Search impressions" },
};

const METRIC_TYPES = ["leads", "cpl", "spend", "conversions", "roas", "seo_clicks", "seo_impressions"] as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; client?: string; source?: string }>;
}) {
  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  const params = await searchParams;
  const range = params.range ?? "30d";
  const clientId = params.client ?? null;
  const source = params.source ?? null;

  const { from, to } = dateRangeFromParam(range);

  const filter = {
    accountId: scope.accountId,
    clientId,
    metricTypes: [...METRIC_TYPES],
    from,
    to,
    source,
  };

  const [kpis, rawRows, sources, alerts] = await Promise.all([
    queryKpiSummaries(filter),
    queryMetrics(filter),
    queryAvailableSources(scope.accountId),
    prisma.alert.findMany({
      where: { accountId: scope.accountId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const trendData = toChartSeries(
    rawRows.filter((r) => ["leads", "conversions", "seo_clicks"].includes(r.metricType)),
    ["leads", "conversions", "seo_clicks"]
  );

  const spendData = toChartSeries(
    rawRows.filter((r) => ["spend", "cpl"].includes(r.metricType)),
    ["spend", "cpl"]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {from.toLocaleDateString()} – {to.toLocaleDateString()}
          </p>
        </div>
        <Suspense>
          <DashboardFilters sources={sources} />
        </Suspense>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRIC_TYPES.map((type) => {
          const kpi = kpis.find((k) => k.metricType === type);
          const meta = KPI_META[type];
          const value = kpi?.current ?? 0;
          return (
            <KpiCard
              key={type}
              title={meta.label}
              value={meta.format(value)}
              change={kpi?.change ?? 0}
              description={meta.description}
            />
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricLineChart
          data={trendData}
          series={["leads", "conversions", "seo_clicks"]}
          title="Leads · Conversions · SEO Clicks (Trend)"
        />
        <MetricBarChart
          data={spendData}
          series={["spend", "cpl"]}
          title="Spend · CPL (Comparison)"
        />
      </div>

      {/* Alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AlertsList
            alerts={alerts.map((a) => ({
              id: a.id,
              title: a.title,
              message: a.message,
              severity: a.severity,
              createdAt: a.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
