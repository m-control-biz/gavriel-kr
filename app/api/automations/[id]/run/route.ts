import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { runAutomation } from "@/lib/automations";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await runAutomation(session.tenantId, id);
  if (!result.ok) return NextResponse.json({ error: result.message }, { status: 400 });
  return NextResponse.json(result);
}
