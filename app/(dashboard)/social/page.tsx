import { redirect } from "next/navigation";
import { getAccountScope } from "@/lib/tenant";
import { listIntegrations } from "@/lib/integrations";
import { queryKpiSummaries, queryMetrics, toChartSeries } from "@/lib/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectIntegrationBanner } from "@/components/connect-integration-banner";
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
  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  const params = await searchParams;
  const range = params.range ?? "30d";
  const clientId = params.client ?? null;
  const { from, to } = dateRangeFromParam(range);

  const [integrations, kpis, rawRows] = await Promise.all([
    listIntegrations(scope.accountId),
    queryKpiSummaries({
      accountId: scope.accountId,
      clientId,
      metricTypes: [...SOCIAL_METRIC_TYPES],
      from,
      to,
      source: "social",
    }),
    queryMetrics({
      accountId: scope.accountId,
      clientId,
      metricTypes: [...SOCIAL_METRIC_TYPES],
      from,
      to,
      source: "social",
    }),
  ]);

  const hasSocial = integrations.some((i) => ["meta_social", "linkedin_social"].includes(i.provider));
  const chartData = toChartSeries(rawRows, [...SOCIAL_METRIC_TYPES]);

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organic Social</h1>
        <p className="text-sm text-muted-foreground">
          Followers, engagement, and reach from Facebook, Instagram, or LinkedIn.
        </p>
      </div>

      <ConnectIntegrationBanner
        title="Facebook, Instagram & LinkedIn"
        description="Connect Meta or LinkedIn to sync followers, engagement, and reach."
        connectLabel="Connect social"
        href="/integrations?provider=social"
        connected={hasSocial}
        comingSoon
      />

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
