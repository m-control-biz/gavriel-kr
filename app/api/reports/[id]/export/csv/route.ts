import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { getReport, hydrateReportData, reportToCsv } from "@/lib/reports";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const report = await getReport(scope.accountId, id);
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
