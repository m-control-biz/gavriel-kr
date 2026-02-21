import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { queryKpiSummaries, queryMetrics, toChartSeries } from "@/lib/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { dateRangeFromParam, formatCompact } from "@/lib/date-utils";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MetricLineChart } from "@/components/dashboard/metric-line-chart";

const SOCIAL_METRIC_TYPES = ["social_followers", "social_engagement", "social_reach"] as const;
const LABEL: Record<string, string> = {
  social_followers: "Followers",
  social_engagement: "Engagement",
  social_reach: "Reach",
};

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; client?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const params = await searchParams;
  const range = params.range ?? "30d";
  const clientId = params.client ?? null;
  const { from, to } = dateRangeFromParam(range);

  const [kpis, rawRows] = await Promise.all([
    queryKpiSummaries({
      tenantId: session.tenantId,
      clientId,
      metricTypes: [...SOCIAL_METRIC_TYPES],
      from,
      to,
      source: "social",
    }),
    queryMetrics({
      tenantId: session.tenantId,
      clientId,
      metricTypes: [...SOCIAL_METRIC_TYPES],
      from,
      to,
      source: "social",
    }),
  ]);

  const chartData = toChartSeries(rawRows, [...SOCIAL_METRIC_TYPES]);

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organic Social</h1>
        <p className="text-sm text-muted-foreground">
          Followers, engagement, and reach. Connect Facebook, Instagram, or LinkedIn (coming soon).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.metricType}
            title={LABEL[kpi.metricType] ?? kpi.metricType}
            value={formatCompact(kpi.current)}
            change={kpi.change}
            description={`vs prior period: ${formatCompact(kpi.previous)}`}
          />
        ))}
      </div>

      <MetricLineChart
        data={chartData}
        series={[...SOCIAL_METRIC_TYPES]}
        title="Social trend — followers, engagement, reach"
      />
    </div>
  );
}
