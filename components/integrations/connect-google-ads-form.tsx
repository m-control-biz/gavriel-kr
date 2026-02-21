"use client";

import { OAuthConnectButton } from "@/components/integrations/oauth-connect-button";
import { Megaphone } from "lucide-react";

export function ConnectGoogleAdsForm({ configured }: { configured?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Connects your Google Ads account. Grants read-only access to campaign spend, conversions, ROAS, and leads data.
      </p>
      <OAuthConnectButton
        provider="google"
        feature="google_ads"
        label="Connect with Google"
        icon={<Megaphone className="h-4 w-4" />}
        configured={configured}
      />
    </div>
  );
}
