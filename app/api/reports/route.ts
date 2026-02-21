import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createReport, listReports } from "@/lib/reports";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  clientId: z.string().optional(),
  metricTypes: z.array(z.string()).min(1),
  dateRange: z.enum(["7d", "30d", "90d", "12m", "custom"]).default("30d"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  breakdown: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  source: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reports = await listReports(session.tenantId);
  return NextResponse.json(reports);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const report = await createReport(session.tenantId, parsed.data as Parameters<typeof createReport>[1]);
  return NextResponse.json(report, { status: 201 });
}
