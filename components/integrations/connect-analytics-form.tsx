"use client";

import { OAuthConnectButton } from "@/components/integrations/oauth-connect-button";
import { BarChart3 } from "lucide-react";

export function ConnectAnalyticsForm({ configured }: { configured?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Connects a Google Analytics 4 property. Grants read-only access to web traffic, sessions, and engagement metrics.
      </p>
      <OAuthConnectButton
        provider="google"
        feature="google_analytics"
        label="Connect with Google"
        icon={<BarChart3 className="h-4 w-4" />}
        configured={configured}
      />
    </div>
  );
}
