import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getReport, hydrateReportData, reportToCsv } from "@/lib/reports";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const report = await getReport(session.tenantId, id);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await hydrateReportData(report);
  const csv = reportToCsv(data);
  const filename = `${report.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
