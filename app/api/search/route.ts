import { NextResponse } from "next/server";
import { getAccountScopeFromRequest } from "@/lib/tenant";
import { search } from "@/lib/search";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(1).max(200),
  modules: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  source: z.string().optional(),
});

export async function GET(request: Request) {
  const scope = await getAccountScopeFromRequest(request);
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    modules: searchParams.get("modules") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    source: searchParams.get("source") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { q, modules, dateFrom, dateTo, source } = parsed.data;

  const results = await search({
    accountId: scope.accountId,
    query: q,
    modules: modules ? (modules.split(",") as never) : undefined,
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    source: source ?? null,
  });

  return NextResponse.json(results);
}
