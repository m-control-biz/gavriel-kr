"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Share2, Trash2, Copy, Check } from "lucide-react";

export function ReportActions({
  reportId,
  shareToken,
}: {
  reportId: string;
  shareToken: string | null;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(shareToken);
  const [copied, setCopied] = useState(false);
  const [loadingShare, setLoadingShare] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  async function handleShare() {
    if (token) {
      // already shared — copy link
      const url = `${window.location.origin}/r/${token}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    setLoadingShare(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/share`, { method: "POST" });
      if (res.ok) {
        const { shareToken: t } = await res.json();
        setToken(t);
        const url = `${window.location.origin}/r/${t}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setLoadingShare(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) router.push("/reports");
    } finally {
      setLoadingDelete(false);
    }
  }

  function handleCsvDownload() {
    window.location.href = `/api/reports/${reportId}/export/csv`;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={handleCsvDownload} className="gap-1.5">
        <Download className="h-4 w-4" /> Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        disabled={loadingShare}
        className="gap-1.5"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-500" /> Copied!
          </>
        ) : (
          <>
            {token ? <Copy className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {token ? "Copy link" : "Share"}
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={loadingDelete}
        className="gap-1.5 text-red-600 hover:text-red-600 hover:border-red-300"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
    </div>
  );
}
