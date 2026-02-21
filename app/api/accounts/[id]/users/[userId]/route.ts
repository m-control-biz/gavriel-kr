import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds, canManageUsers } from "@/lib/account";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  role: z.enum(["Owner", "Admin", "Editor", "Viewer"]),
});

async function requireManageAccess(session: Awaited<ReturnType<typeof getSession>>, accountId: string) {
  if (!session) return null;
  const ids = await getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false);
  if (!ids.includes(accountId)) return null;
  const uar = await prisma.userAccountRole.findUnique({
    where: { userId_accountId: { userId: session.sub, accountId } },
  });
  const role = (uar?.role ?? "Viewer") as "Owner" | "Admin" | "Editor" | "Viewer";
  if (!canManageUsers(role)) return null;
  return role;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const session = await getSession();
  const myRole = await requireManageAccess(session, id);
  if (!myRole) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const uar = await prisma.userAccountRole.update({
    where: { userId_accountId: { userId, accountId: id } },
    data: { role: parsed.data.role },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
  return NextResponse.json(uar);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const session = await getSession();
  const myRole = await requireManageAccess(session, id);
  if (!myRole) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cannot remove yourself if you're the only Owner
  if (userId === session!.sub) {
    const ownerCount = await prisma.userAccountRole.count({ where: { accountId: id, role: "Owner" } });
    if (ownerCount <= 1 && myRole === "Owner") {
      return NextResponse.json({ error: "Cannot remove the only Owner" }, { status: 400 });
    }
  }

  await prisma.userAccountRole.delete({
    where: { userId_accountId: { userId, accountId: id } },
  });
  return NextResponse.json({ ok: true });
}
