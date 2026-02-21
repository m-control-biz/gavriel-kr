import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds } from "@/lib/account";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Settings, Users, Plug } from "lucide-react";

export default async function AccountsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const accountIds = await getAccessibleAccountIds(
    session.sub,
    session.tenantId,
    session.isSuperAdmin ?? false
  );
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, name: true, industry: true, timezone: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 py-6 px-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-sm text-muted-foreground">
          Switch account via the top bar. Manage settings, users, and integrations per account.
        </p>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No accounts assigned. Contact your administrator.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{account.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link href={`/accounts/${account.id}/settings`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Settings className="h-4 w-4" /> Settings
                  </Button>
                </Link>
                <Link href={`/accounts/${account.id}/users`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Users className="h-4 w-4" /> Users
                  </Button>
                </Link>
                <Link href={`/accounts/${account.id}/integrations`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Plug className="h-4 w-4" /> Integrations
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
