"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  provider: string;  // "google" | "meta" | "linkedin"
  feature: string;   // "gsc" | "google_analytics" | "google_ads" | "meta_social" | "linkedin_social"
  label: string;
  icon?: React.ReactNode;
};

export function OAuthConnectButton({ provider, feature, label, icon }: Props) {
  const [loading, setLoading] = useState(false);

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
