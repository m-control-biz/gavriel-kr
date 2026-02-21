import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { queryKpiSummaries, queryMetrics, toChartSeries } from "@/lib/metrics";
import { dateRangeFromParam } from "@/lib/date-utils";

export async function GET(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "30d";
  const clientId = searchParams.get("client") ?? null;
  const source = searchParams.get("source") ?? null;

  const { from, to } = dateRangeFromParam(range);

  const metricTypes = ["leads", "cpl", "spend", "conversions", "roas", "seo_clicks", "seo_impressions"] as const;

  const filter = {
    accountId: scope.accountId,
    clientId,
    metricTypes: [...metricTypes],
    from,
    to,
    source,
  };

  const [kpis, rawRows] = await Promise.all([
    queryKpiSummaries(filter),
    queryMetrics(filter),
  ]);

  const trendSeries = toChartSeries(rawRows.filter((r) => ["leads", "conversions", "seo_clicks"].includes(r.metricType)), ["leads", "conversions", "seo_clicks"]);
  const spendSeries = toChartSeries(rawRows.filter((r) => ["spend", "cpl"].includes(r.metricType)), ["spend", "cpl"]);

  return NextResponse.json({ kpis, trendSeries, spendSeries });
}
