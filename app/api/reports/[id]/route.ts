import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { getReport, updateReport, deleteReport, hydrateReportData } from "@/lib/reports";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  clientId: z.string().optional(),
  metricTypes: z.array(z.string()).min(1).optional(),
  dateRange: z.enum(["7d", "30d", "90d", "12m", "custom"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  breakdown: z.enum(["daily", "weekly", "monthly"]).optional(),
  source: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const report = await getReport(scope.accountId, id);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await hydrateReportData(report);
  return NextResponse.json({ report, data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await getReport(scope.accountId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await updateReport(scope.accountId, id, parsed.data as Parameters<typeof updateReport>[2]);
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getReport(scope.accountId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteReport(scope.accountId, id);
  return NextResponse.json({ ok: true });
}
