"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function AddLeadForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [source, setSource] = useState("manual");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, source }),
      });
      if (res.ok) {
        setEmail("");
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
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" /> Add lead
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="lead@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-48"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="source">Source</Label>
        <select
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="manual">Manual</option>
          <option value="website">Website</option>
          <option value="google_ads">Google Ads</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Adding…" : "Add"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
