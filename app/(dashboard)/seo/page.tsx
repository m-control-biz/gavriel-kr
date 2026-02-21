import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { queryKpiSummaries } from "@/lib/metrics";
import { listSeoKeywords } from "@/lib/seo";
import { dateRangeFromParam, formatCompact } from "@/lib/date-utils";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

const SEO_METRIC_TYPES = ["seo_clicks", "seo_impressions"] as const;
const LABEL: Record<string, string> = { seo_clicks: "SEO Clicks", seo_impressions: "SEO Impressions" };

export default async function SeoPage({
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

  const [kpis, keywords] = await Promise.all([
    queryKpiSummaries({
      tenantId: session.tenantId,
      clientId,
      metricTypes: [...SEO_METRIC_TYPES],
      from,
      to,
    }),
    listSeoKeywords({ tenantId: session.tenantId, clientId, from, to, limit: 50 }),
  ]);

  return (
    <div className="space-y-6 py-6 px-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SEO</h1>
        <p className="text-sm text-muted-foreground">
          Search performance and keyword data. Connect Search Console to sync (coming soon).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Keywords</CardTitle>
        </CardHeader>
        <CardContent>
          {keywords.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No keyword data yet. Add keywords via sync or manual import (coming soon).
            </p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground">Keyword</th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">Clicks</th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">Impressions</th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">Position</th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{row.keyword}</td>
                      <td className="py-3 px-4 text-right">{row.clicks}</td>
                      <td className="py-3 px-4 text-right">{row.impressions}</td>
                      <td className="py-3 px-4 text-right">{row.position.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
