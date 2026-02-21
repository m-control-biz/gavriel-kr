"use client";

import { OAuthConnectButton } from "@/components/integrations/oauth-connect-button";
import { Search } from "lucide-react";

export function ConnectSearchConsoleForm({ configured }: { configured?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Connects your Google Search Console property. Grants read-only access to search query data, clicks, impressions, and keyword positions.
      </p>
      <OAuthConnectButton
        provider="google"
        feature="gsc"
        label="Connect with Google"
        icon={<Search className="h-4 w-4" />}
        configured={configured}
      />
    </div>
  );
}
