"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plug, Check } from "lucide-react";

interface ConnectIntegrationBannerProps {
  title: string;
  description: string;
  connectLabel?: string;
  href?: string;
  connected?: boolean;
  comingSoon?: boolean;
}

export function ConnectIntegrationBanner({
  title,
  description,
  connectLabel = "Connect",
  href = "/integrations",
  connected = false,
  comingSoon = false,
}: ConnectIntegrationBannerProps) {
  if (connected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20 px-4 py-2 text-sm">
        <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
        <span className="text-green-800 dark:text-green-200">{title} is connected. Data will appear here when synced.</span>
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 py-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
          <Plug className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        {comingSoon ? (
          <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Coming soon
          </span>
        ) : (
          <Link href={href} className="shrink-0">
            <Button className="gap-1.5">
              <Plug className="h-4 w-4" /> {connectLabel}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
