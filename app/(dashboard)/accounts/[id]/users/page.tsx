import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds } from "@/lib/account";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Users } from "lucide-react";

export default async function AccountUsersPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const accountIds = await getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false);
  const { id } = await params;
  if (!accountIds.includes(id)) notFound();

  const account = await prisma.account.findFirst({ where: { id }, select: { name: true } });
  if (!account) notFound();

  const userRoles = await prisma.userAccountRole.findMany({
    where: { accountId: id },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  return (
    <div className="space-y-6 py-6 px-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/accounts">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Accounts
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Users — {account.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users assigned yet.</p>
          ) : (
            <ul className="space-y-2">
              {userRoles.map((ur) => (
                <li key={ur.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="font-medium">{ur.user.name ?? ur.user.email}</span>
                  <span className="text-xs rounded-full bg-muted px-2 py-0.5">{ur.role}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Add user / assign role: extend with invite-by-email and role dropdown (Owner, Admin, Editor, Viewer).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
