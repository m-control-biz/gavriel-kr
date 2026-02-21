"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  provider: string;     // "google" | "meta" | "linkedin"
  feature: string;      // "gsc" | "google_analytics" | "google_ads" | "meta_social" | "linkedin_social"
  label: string;
  icon?: React.ReactNode;
  configured?: boolean; // false = env vars not set yet
};

export function OAuthConnectButton({ provider, feature, label, icon, configured = true }: Props) {
  const [loading, setLoading] = useState(false);

  if (!configured) {
    return (
      <div className="rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium">Setup required:</span> Add{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">
          {provider.toUpperCase()}_CLIENT_ID
        </code>{" "}
        and{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">
          {provider.toUpperCase()}_CLIENT_SECRET
        </code>{" "}
        to your environment variables, then redeploy.
      </div>
    );
  }

  function handleConnect() {
    setLoading(true);
    window.location.href = `/api/integrations/connect/${provider}?feature=${feature}`;
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleConnect}
      disabled={loading}
    >
      {icon}
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
