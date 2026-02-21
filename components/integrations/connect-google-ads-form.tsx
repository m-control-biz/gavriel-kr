"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Megaphone } from "lucide-react";

export function ConnectGoogleAdsForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google_ads",
          name: name.trim(),
          credentials: { apiKey: apiKey.trim() || "placeholder" },
        }),
      });
      if (res.ok) {
        setName("");
        setApiKey("");
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
        <Megaphone className="h-4 w-4" /> Connect Google Ads
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 max-w-md">
      <h3 className="font-medium">Connect Google Ads</h3>
      <p className="text-sm text-muted-foreground">
        Enter a name for this account. API credentials (OAuth) can be added later for live sync.
      </p>
      <div className="space-y-1">
        <Label htmlFor="name">Account name *</Label>
        <Input
          id="name"
          placeholder="e.g. Main Google Ads"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="apiKey">API key (optional for now)</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Leave empty to use mock sync"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Connecting…" : "Connect"}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
