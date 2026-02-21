"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export function AddArticleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), aiPrompt: brief.trim() || undefined }),
      });
      if (res.ok) {
        const article = await res.json();
        setTitle("");
        setBrief("");
        setOpen(false);
        router.push(`/content/${article.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" /> New article
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 max-w-md">
      <h3 className="font-medium">New article</h3>
      <div className="space-y-1">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="brief">Brief (for AI)</Label>
        <textarea
          id="brief"
          placeholder="What should the article cover?"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create"}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
