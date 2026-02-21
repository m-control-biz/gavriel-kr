"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";

type Item = { id: string; name: string; trigger: string; action: string; isActive: boolean };

export function AutomationsList({ initialList }: { initialList: Item[] }) {
  const router = useRouter();
  const [running, setRunning] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleRun(id: string) {
    setRunning(id);
    try {
      const res = await fetch(`/api/automations/${id}/run`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setRunning(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this automation?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/automations/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  if (initialList.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No automations yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {initialList.map((item) => (
        <li key={item.id} className="flex items-center justify-between rounded-md border px-4 py-3">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              When {item.trigger} → {item.action}
              {!item.isActive && " (paused)"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRun(item.id)}
              disabled={!!running}
              className="gap-1"
            >
              <Play className="h-4 w-4" />
              {running === item.id ? "Running…" : "Run"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} disabled={!!deleting}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
