"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Save, Trash2 } from "lucide-react";

type Article = { id: string; title: string; body: string | null; aiPrompt: string | null; status: string };

export function ArticleEditor({ article }: { article: Article }) {
  const router = useRouter();
  const [title, setTitle] = useState(article.title);
  const [body, setBody] = useState(article.body ?? "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/articles/${article.id}/generate`, { method: "POST" });
      const data = await res.json();
      if (data.body) setBody(data.body);
      router.refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    router.push("/content");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold"
        />
      </div>
      {article.aiPrompt && (
        <p className="text-sm text-muted-foreground">
          <strong>Brief:</strong> {article.aiPrompt}
        </p>
      )}
      <div className="space-y-1">
        <Label htmlFor="body">Body</Label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full min-h-[280px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
          placeholder="Write or generate content…"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleGenerate} disabled={generating} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating…" : "Generate with AI"}
        </Button>
        <Button variant="outline" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
