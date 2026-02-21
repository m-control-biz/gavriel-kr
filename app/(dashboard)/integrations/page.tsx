import { redirect } from "next/navigation";
import { getAccountScope } from "@/lib/tenant";
import { listIntegrations } from "@/lib/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationsList } from "@/components/integrations/integrations-list";
import { ConnectGoogleAdsForm } from "@/components/integrations/connect-google-ads-form";
import { ConnectSearchConsoleForm } from "@/components/integrations/connect-search-console-form";
import { ConnectAnalyticsForm } from "@/components/integrations/connect-analytics-form";
import { OAuthConnectButton } from "@/components/integrations/oauth-connect-button";
import { Megaphone, Search, BarChart3, Share2, Linkedin } from "lucide-react";
import { IntegrationSection } from "@/components/integrations/integration-section";

const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const metaConfigured = !!(process.env.META_APP_ID && process.env.META_APP_SECRET);
const linkedinConfigured = !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; connected?: string; error?: string }>;
}) {
  const scope = await getAccountScope();
  if (!scope) redirect("/auth/login");

  const params = await searchParams;
  const highlightProvider = params.provider ?? null;
  const connected = params.connected === "1";
  const oauthError = params.error ?? null;

  const integrations = await listIntegrations(scope.accountId);

  return (
    <div className="space-y-8 py-6 px-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Connect each account to the right data source using secure OAuth. Credentials are stored encrypted.
        </p>
      </div>

      {connected && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Integration connected successfully.
        </div>
      )}

      {oauthError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <span className="font-medium">Connection error:</span> {oauthError}
        </div>
      )}

      <IntegrationSection
        id="google_ads"
        title="Dashboard — Google Ads"
        description="Spend, conversions, ROAS. Powers the main dashboard KPIs."
        icon={<Megaphone className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "google_ads"}
      >
        <ConnectGoogleAdsForm configured={googleConfigured} />
      </IntegrationSection>

      <IntegrationSection
        id="google_analytics"
        title="Account analytics — Google Analytics"
        description="Web traffic and behavior. Connect one GA4 property per account."
        icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "google_analytics"}
      >
        <ConnectAnalyticsForm configured={googleConfigured} />
      </IntegrationSection>

      <IntegrationSection
        id="gsc"
        title="SEO — Google Search Console"
        description="Search queries and keyword data for the SEO section."
        icon={<Search className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "gsc"}
      >
        <ConnectSearchConsoleForm configured={googleConfigured} />
      </IntegrationSection>

      <IntegrationSection
        id="meta_social"
        title="Social — Meta (Facebook & Instagram)"
        description="Page followers, reach, engagement, and ad insights."
        icon={<Share2 className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "meta_social"}
      >
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Connects your Facebook Page and Instagram Business account for organic + paid social metrics.
          </p>
          <OAuthConnectButton
            provider="meta"
            feature="meta_social"
            label="Connect with Meta"
            icon={<Share2 className="h-4 w-4" />}
            configured={metaConfigured}
          />
        </div>
      </IntegrationSection>

      <IntegrationSection
        id="linkedin_social"
        title="Social — LinkedIn"
        description="Company page followers, engagement, and ad metrics."
        icon={<Linkedin className="h-5 w-5 text-muted-foreground" />}
        highlight={highlightProvider === "linkedin_social"}
      >
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Connects your LinkedIn Company Page for follower growth, post engagement, and ads data.
          </p>
          <OAuthConnectButton
            provider="linkedin"
            feature="linkedin_social"
            label="Connect with LinkedIn"
            icon={<Linkedin className="h-4 w-4" />}
            configured={linkedinConfigured}
          />
        </div>
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
