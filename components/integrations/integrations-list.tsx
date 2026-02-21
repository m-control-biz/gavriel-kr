"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";
import { getProvider } from "@/lib/integration-providers";

type Item = { id: string; provider: string; name: string | null; externalPropertyId: string | null; isActive: boolean; createdAt: Date };

export function IntegrationsList({ initialList }: { initialList: Item[] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleSync(id: string) {
    setSyncing(id);
    try {
      const res = await fetch(`/api/integrations/${id}/sync`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setSyncing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this integration? Stored credentials will be deleted.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  if (initialList.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No integrations connected yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {initialList.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between rounded-md border px-4 py-3"
        >
          <div>
            <p className="font-medium">{item.name ?? getProvider(item.provider).label}</p>
            <p className="text-xs text-muted-foreground">{getProvider(item.provider).label}</p>
          </div>
          <div className="flex gap-2">
            {item.provider === "google_ads" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync(item.id)}
                disabled={!!syncing}
                className="gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${syncing === item.id ? "animate-spin" : ""}`} />
                {syncing === item.id ? "Syncing…" : "Sync"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item.id)}
              disabled={!!deleting}
              className="text-red-600 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
