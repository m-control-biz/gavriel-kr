import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds, canManageUsers, isOwner } from "@/lib/account";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { EditAccountForm } from "@/components/accounts/edit-account-form";

export default async function AccountSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const accountIds = await getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false);
  if (!accountIds.includes(id)) notFound();

  const account = await prisma.account.findFirst({
    where: { id },
    select: { id: true, name: true, industry: true, timezone: true, logo: true, primaryColor: true },
  });
  if (!account) notFound();

  const uar = await prisma.userAccountRole.findUnique({
    where: { userId_accountId: { userId: session.sub, accountId: id } },
  });
  const role = (uar?.role ?? "Viewer") as "Owner" | "Admin" | "Editor" | "Viewer";

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
      </div>

      <EditAccountForm
        account={account}
        canEdit={canManageUsers(role)}
        isOwner={isOwner(role)}
      />
    </div>
  );
}
