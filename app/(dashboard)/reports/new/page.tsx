"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const METRIC_OPTIONS = [
  { value: "leads", label: "Leads" },
  { value: "cpl", label: "Cost per Lead" },
  { value: "spend", label: "Ad Spend" },
  { value: "conversions", label: "Conversions" },
  { value: "roas", label: "ROAS" },
  { value: "seo_clicks", label: "SEO Clicks" },
  { value: "seo_impressions", label: "SEO Impressions" },
];

const DATE_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

const BREAKDOWNS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function NewReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metricTypes, setMetricTypes] = useState<string[]>(["leads", "spend"]);
  const [dateRange, setDateRange] = useState("30d");
  const [breakdown, setBreakdown] = useState("daily");

  function toggleMetric(value: string) {
    setMetricTypes((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
    );
  }

  async function handleCreate() {
    if (!name.trim()) { setError("Report name is required."); return; }
    if (metricTypes.length === 0) { setError("Select at least one metric."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description, metricTypes, dateRange, breakdown }),
      });
      if (!res.ok) { setError("Failed to create report."); return; }
      const report = await res.json();
      router.push(`/reports/${report.id}`);
    } catch {
      setError("Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {["Details", "Metrics", "Options"].map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === i + 1
                  ? "bg-primary text-primary-foreground"
                  : step > i + 1
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <span className={step === i + 1 ? "text-foreground font-medium" : ""}>{s}</span>
            {i < 2 && <span className="text-muted-foreground/40 mx-1">›</span>}
          </span>
        ))}
      </div>

      {/* Step 1 — Details */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Report details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Q1 Performance Report"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                placeholder="Optional description…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button onClick={() => { if (!name.trim()) { setError("Name required."); return; } setError(""); setStep(2); }} className="w-full">
              Next
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Metrics */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {METRIC_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => toggleMetric(m.value)}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                    metricTypes.includes(m.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{metricTypes.length} metric(s) selected</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button
                onClick={() => { if (metricTypes.length === 0) { setError("Select at least one metric."); return; } setError(""); setStep(3); }}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Options */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Date range &amp; breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Date range</Label>
              <div className="grid grid-cols-2 gap-2">
                {DATE_RANGES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDateRange(d.value)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      dateRange === d.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Breakdown</Label>
              <div className="flex gap-2">
                {BREAKDOWNS.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setBreakdown(b.value)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium flex-1 transition-colors ${
                      breakdown === b.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleCreate} disabled={loading} className="flex-1">
                {loading ? "Creating…" : "Create report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step < 3 && error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
