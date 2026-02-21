"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

const TRIGGERS = [
  { value: "lead_created", label: "When lead is created" },
  { value: "metric_threshold", label: "When metric exceeds threshold" },
];
const ACTIONS = [
  { value: "create_alert", label: "Create alert" },
  { value: "send_email", label: "Send email (coming soon)" },
];

export function AddAutomationForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("lead_created");
  const [action, setAction] = useState("create_alert");
  const [alertTitle, setAlertTitle] = useState("New lead");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          trigger,
          action,
          actionConfig: action === "create_alert" ? { title: alertTitle, message: "Triggered by automation" } : undefined,
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
        <Zap className="h-4 w-4" /> New automation
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-3 max-w-md">
      <h3 className="font-medium">New automation</h3>
      <div className="space-y-1">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" placeholder="e.g. Alert on new lead" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>Trigger</Label>
        <select
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {TRIGGERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label>Action</Label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>
      {action === "create_alert" && (
        <div className="space-y-1">
          <Label htmlFor="alertTitle">Alert title</Label>
          <Input id="alertTitle" value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)} />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create"}</Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
