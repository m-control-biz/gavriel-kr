import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds } from "@/lib/account";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Settings, Users, Plug } from "lucide-react";
import { CreateAccountForm } from "@/components/accounts/create-account-form";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Each account is fully isolated — its own data, users, and integrations.
          </p>
        </div>
        <CreateAccountForm />
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No accounts yet. Create your first account above.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{account.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {account.industry && <span>{account.industry}</span>}
                  {account.industry && account.timezone && <span>·</span>}
                  {account.timezone && <span>{account.timezone}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
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
