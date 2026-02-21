"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export function ConnectSearchConsoleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "gsc",
          name: name.trim() || "Search Console",
          credentials: {},
        }),
      });
      if (res.ok) {
        setName("");
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
        <Search className="h-4 w-4" /> Connect Search Console
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 max-w-md">
      <h3 className="font-medium">Connect Google Search Console</h3>
      <p className="text-sm text-muted-foreground">
        Link a property to sync search queries and keyword data. OAuth can be added later for live sync.
      </p>
      <div className="space-y-1">
        <Label htmlFor="gsc-name">Property label *</Label>
        <Input
          id="gsc-name"
          placeholder="e.g. https://example.com"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Connecting…" : "Connect"}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
