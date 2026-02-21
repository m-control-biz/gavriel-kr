import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAccountScope } from "@/lib/tenant";
import { getReport, hydrateReportData } from "@/lib/reports";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MetricLineChart } from "@/components/dashboard/metric-line-chart";
import { ReportActions } from "@/components/reports/report-actions";
import { formatCompact, formatCurrency, formatMultiplier } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CURRENCY_METRICS = new Set(["spend", "cpl"]);
const MULTIPLIER_METRICS = new Set(["roas"]);

function formatKpiValue(metricType: string, value: number): string {
  if (CURRENCY_METRICS.has(metricType)) return formatCurrency(value);
  if (MULTIPLIER_METRICS.has(metricType)) return formatMultiplier(value);
  return formatCompact(value);
}

function metricLabel(type: string) {
  const MAP: Record<string, string> = {
    leads: "Leads",
    cpl: "Cost per Lead",
    spend: "Ad Spend",
    conversions: "Conversions",
    roas: "ROAS",
    seo_clicks: "SEO Clicks",
    seo_impressions: "SEO Impressions",
  };
  return MAP[type] ?? type;
}

export default async function ReportViewPage({ params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  const { id } = await params;
  const report = await getReport(scope.accountId, id);
  if (!report) notFound();

  const data = await hydrateReportData(report);

  const dateLabel =
    report.dateRange === "custom"
      ? `${data.from.toLocaleDateString()} – ${data.to.toLocaleDateString()}`
      : { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", "12m": "Last 12 months" }[
          report.dateRange
        ] ?? report.dateRange;

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
                <ChevronLeft className="h-4 w-4" /> Reports
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{report.name}</h1>
          {report.description && (
            <p className="text-sm text-muted-foreground">{report.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {dateLabel} &middot; {report.breakdown} breakdown
          </p>
        </div>
        <ReportActions reportId={id} shareToken={report.shareToken} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.kpis.map((kpi) => (
          <KpiCard
            key={kpi.metricType}
            title={metricLabel(kpi.metricType)}
            value={formatKpiValue(kpi.metricType, kpi.current)}
            change={kpi.change}
            description={`vs prior period: ${formatKpiValue(kpi.metricType, kpi.previous)}`}
          />
        ))}
      </div>

      {/* Trend Chart */}
      <MetricLineChart
        data={data.chart}
        series={data.metricTypes}
        title={`Trend — ${data.metricTypes.map(metricLabel).join(", ")}`}
      />

      {/* Comparison table */}
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Metric</th>
              <th className="py-3 px-4 text-right font-medium text-muted-foreground">Current period</th>
              <th className="py-3 px-4 text-right font-medium text-muted-foreground">Previous period</th>
              <th className="py-3 px-4 text-right font-medium text-muted-foreground">Change</th>
            </tr>
          </thead>
          <tbody>
            {data.kpis.map((kpi, i) => (
              <tr key={kpi.metricType} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                <td className="py-3 px-4 font-medium">{metricLabel(kpi.metricType)}</td>
                <td className="py-3 px-4 text-right">{formatKpiValue(kpi.metricType, kpi.current)}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">
                  {formatKpiValue(kpi.metricType, kpi.previous)}
                </td>
                <td
                  className={`py-3 px-4 text-right font-semibold ${
                    kpi.change > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : kpi.change < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {kpi.change > 0 ? "+" : ""}
                  {kpi.change.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
