"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, PlugZap } from "lucide-react";
import { getProvider } from "@/lib/integration-providers";

type ConnectionStatus = "ok" | "error" | "unknown";

type Meta = {
  connectionStatus?: ConnectionStatus;
  lastCheckedAt?: string;
  lastError?: string | null;
};

type Item = {
  id: string;
  provider: string;
  name: string | null;
  externalPropertyId: string | null;
  isActive: boolean;
  metadataJson: unknown;
  createdAt: Date;
};

function parseMeta(raw: unknown): Meta {
  if (!raw || typeof raw !== "object") return {};
  const m = raw as Record<string, unknown>;
  return {
    connectionStatus: (m.connectionStatus as ConnectionStatus) ?? undefined,
    lastCheckedAt: typeof m.lastCheckedAt === "string" ? m.lastCheckedAt : undefined,
    lastError: typeof m.lastError === "string" ? m.lastError : null,
  };
}

function StatusDot({ status }: { status: ConnectionStatus | undefined }) {
  if (status === "ok") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Connected
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Connection error
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium">
      <span className="h-2 w-2 rounded-full bg-yellow-400" />
      Not verified
    </span>
  );
}

export function IntegrationsList({ initialList }: { initialList: Item[] }) {
  const router = useRouter();
  const [checking, setChecking] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [localMeta, setLocalMeta] = useState<Record<string, Meta>>({});

  async function handleCheck(id: string) {
    setChecking(id);
    try {
      const res = await fetch(`/api/integrations/${id}/check`, { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as Meta;
        setLocalMeta((prev) => ({ ...prev, [id]: data }));
        router.refresh();
      }
    } finally {
      setChecking(null);
    }
  }

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
      {initialList.map((item) => {
        const meta = localMeta[item.id] ?? parseMeta(item.metadataJson);
        const status = meta.connectionStatus;
        const lastChecked = meta.lastCheckedAt
          ? new Date(meta.lastCheckedAt).toLocaleString()
          : null;

        return (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-md border px-4 py-3 gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">{item.name ?? item.externalPropertyId ?? getProvider(item.provider).label}</p>
                <StatusDot status={status} />
              </div>
              <p className="text-xs text-muted-foreground">{getProvider(item.provider).label}</p>
              {meta.lastError && (
                <p className="text-xs text-red-500 mt-0.5 truncate">{meta.lastError}</p>
              )}
              {lastChecked && !meta.lastError && (
                <p className="text-xs text-muted-foreground mt-0.5">Last checked: {lastChecked}</p>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCheck(item.id)}
                disabled={!!checking || !!deleting}
                className="gap-1"
                title="Check connection"
              >
                <PlugZap className={`h-4 w-4 ${checking === item.id ? "animate-pulse" : ""}`} />
                {checking === item.id ? "Checking…" : status === "error" ? "Reconnect" : "Check"}
              </Button>

              {item.provider === "google_ads" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(item.id)}
                  disabled={!!syncing || !!deleting}
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
                disabled={!!deleting || !!checking}
                className="text-red-600 hover:text-red-600"
                title="Remove integration"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
