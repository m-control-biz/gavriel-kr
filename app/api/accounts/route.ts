import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  industry: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const account = await prisma.account.create({
    data: {
      tenantId: session.tenantId,
      name: parsed.data.name,
      industry: parsed.data.industry,
      timezone: parsed.data.timezone ?? "UTC",
    },
  });

  // Creator becomes Owner
  await prisma.userAccountRole.create({
    data: { userId: session.sub, accountId: account.id, role: "Owner" },
  });

  return NextResponse.json(account, { status: 201 });
}
