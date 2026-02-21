import { notFound } from "next/navigation";
import { getReportByShareToken, hydrateReportData } from "@/lib/reports";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MetricLineChart } from "@/components/dashboard/metric-line-chart";
import { formatCompact, formatCurrency, formatMultiplier } from "@/lib/date-utils";

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

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await getReportByShareToken(token);
  if (!report) notFound();

  const data = await hydrateReportData(report);

  const dateLabel =
    report.dateRange === "custom"
      ? `${data.from.toLocaleDateString()} – ${data.to.toLocaleDateString()}`
      : { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", "12m": "Last 12 months" }[
          report.dateRange
        ] ?? report.dateRange;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            m-control.biz
          </p>
          <h1 className="text-xl font-bold tracking-tight">{report.name}</h1>
          {report.description && (
            <p className="text-sm text-muted-foreground">{report.description}</p>
          )}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{dateLabel}</p>
          <p className="capitalize">{report.breakdown} breakdown</p>
          {report.shareExpiry && (
            <p className="mt-1">Expires {new Date(report.shareExpiry).toLocaleDateString()}</p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* KPIs */}
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
                <th className="py-3 px-4 text-right font-medium text-muted-foreground">Current</th>
                <th className="py-3 px-4 text-right font-medium text-muted-foreground">Previous</th>
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

        <p className="text-center text-xs text-muted-foreground pt-4">
          Powered by m-control.biz · Report generated on {new Date().toLocaleDateString()}
        </p>
      </main>
    </div>
  );
}
