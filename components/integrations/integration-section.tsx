"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IntegrationSectionProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
  comingSoon?: boolean;
  children: React.ReactNode;
}

export function IntegrationSection({
  id,
  title,
  description,
  icon,
  highlight = false,
  comingSoon = false,
  children,
}: IntegrationSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlight && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [highlight]);

  return (
    <Card
      ref={ref}
      id={id}
      className={highlight ? "ring-2 ring-primary/50" : undefined}
    >
      <CardHeader className="flex flex-row items-center gap-2">
        {icon}
        <CardTitle className="text-base">{title}</CardTitle>
        {comingSoon && (
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Coming soon
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        {children}
      </CardContent>
    </Card>
  );
}
