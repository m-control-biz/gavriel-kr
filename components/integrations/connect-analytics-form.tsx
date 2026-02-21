"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";

export function ConnectAnalyticsForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [propertyId, setPropertyId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google_analytics",
          name: name.trim() || "GA4",
          externalPropertyId: propertyId.trim() || undefined,
          credentials: {},
        }),
      });
      if (res.ok) {
        setName("");
        setPropertyId("");
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-1.5">
        <BarChart3 className="h-4 w-4" /> Connect Google Analytics
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 max-w-md">
      <h3 className="font-medium">Connect Google Analytics (GA4)</h3>
      <p className="text-sm text-muted-foreground">
        One property per account. OAuth and data sync can be added later.
      </p>
      <div className="space-y-1">
        <Label htmlFor="ga-name">Account / property label *</Label>
        <Input
          id="ga-name"
          placeholder="e.g. Main website"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="ga-property">Property ID (optional)</Label>
        <Input
          id="ga-property"
          placeholder="e.g. 123456789"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Connecting…" : "Connect"}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
