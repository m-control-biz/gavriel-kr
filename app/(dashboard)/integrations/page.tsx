import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listIntegrations } from "@/lib/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationsList } from "@/components/integrations/integrations-list";
import { ConnectGoogleAdsForm } from "@/components/integrations/connect-google-ads-form";
import { Megaphone } from "lucide-react";

export default async function IntegrationsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const integrations = await listIntegrations(session.tenantId);

  return (
    <div className="space-y-6 py-6 px-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect Google Ads, Search Console, and other sources. Credentials are stored encrypted.
        </p>
      </div>

      <ConnectGoogleAdsForm />

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Megaphone className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Connected accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegrationsList initialList={integrations} />
        </CardContent>
      </Card>
    </div>
  );
}
