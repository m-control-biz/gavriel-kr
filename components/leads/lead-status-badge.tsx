"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  contacted: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  qualified: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export function LeadStatusBadge({ status, leadId }: { status: string; leadId: string }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function changeStatus(newStatus: string) {
    if (newStatus === status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) router.refresh();
    } finally {
      setUpdating(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => changeStatus(e.target.value)}
      disabled={updating}
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer",
        STATUS_STYLE[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {(["new", "contacted", "qualified", "won", "lost"] as const).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
