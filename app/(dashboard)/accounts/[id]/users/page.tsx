import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds, canManageUsers } from "@/lib/account";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ManageUsers } from "@/components/accounts/manage-users";

export default async function AccountUsersPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const accountIds = await getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false);
  if (!accountIds.includes(id)) notFound();

  const account = await prisma.account.findFirst({ where: { id }, select: { name: true } });
  if (!account) notFound();

  const uar = await prisma.userAccountRole.findUnique({
    where: { userId_accountId: { userId: session.sub, accountId: id } },
  });
  const myRole = (uar?.role ?? "Viewer") as "Owner" | "Admin" | "Editor" | "Viewer";

  const userRoles = await prisma.userAccountRole.findMany({
    where: { accountId: id },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6 py-6 px-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/accounts">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Accounts
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-sm">{account.name}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">Users</span>
      </div>

      <ManageUsers
        accountId={id}
        accountName={account.name}
        initialUsers={userRoles.map((ur) => ({
          id: ur.id,
          userId: ur.userId,
          role: ur.role,
          user: ur.user,
        }))}
        canManage={canManageUsers(myRole)}
        currentUserId={session.sub}
      />
    </div>
  );
}
