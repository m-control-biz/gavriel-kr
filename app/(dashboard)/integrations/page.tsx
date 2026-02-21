import { redirect } from "next/navigation";
import Link from "next/link";
import { getAccountScope } from "@/lib/tenant";
import { listIntegrations } from "@/lib/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationsList } from "@/components/integrations/integrations-list";
import { ConnectGoogleAdsForm } from "@/components/integrations/connect-google-ads-form";
import { ConnectSearchConsoleForm } from "@/components/integrations/connect-search-console-form";
import { ConnectAnalyticsForm } from "@/components/integrations/connect-analytics-form";
import { Megaphone, Search, BarChart3, Share2 } from "lucide-react";
import { IntegrationSection } from "@/components/integrations/integration-section";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  const params = await searchParams;
  const highlightProvider = params.provider ?? null;

  const integrations = await listIntegrations(scope.accountId);

  return (
    <div className="space-y-8 py-6 px-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Connect each account to the right data source. SEO → Search Console, Analytics → GA4, Ads → Google Ads. Credentials are stored encrypted.
        </p>
      </div>

      <IntegrationSection
        id="google_ads"
        title="Dashboard & paid campaigns"
        description="Spend, conversions, ROAS. Powers the main dashboard KPIs."
        icon={<Megaphone className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "google_ads"}
      >
        <ConnectGoogleAdsForm />
      </IntegrationSection>

      <IntegrationSection
        id="google_analytics"
        title="Account analytics"
        description="Web traffic and behavior. Connect one Google Analytics (GA4) property per account."
        icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "google_analytics"}
      >
        <ConnectAnalyticsForm />
      </IntegrationSection>

      <IntegrationSection
        id="gsc"
        title="SEO — Search Console"
        description="Search queries and keyword data for the SEO section."
        icon={<Search className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "gsc"}
      >
        <ConnectSearchConsoleForm />
      </IntegrationSection>

      <IntegrationSection
        id="social"
        title="Organic social"
        description="Facebook, Instagram, LinkedIn followers and engagement."
        icon={<Share2 className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "social"}
        comingSoon
      >
        <p className="text-sm text-muted-foreground">Meta & LinkedIn connectors coming soon.</p>
      </IntegrationSection>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Megaphone className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Connected for this account</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegrationsList initialList={integrations} />
        </CardContent>
      </Card>
    </div>
  );
}
