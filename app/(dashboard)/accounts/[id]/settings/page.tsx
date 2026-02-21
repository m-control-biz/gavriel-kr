import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAccountScope } from "@/lib/tenant";
import { getAccessibleAccountIds } from "@/lib/account";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default async function AccountSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const accountIds = await getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false);
  const { id } = await params;
  if (!accountIds.includes(id)) notFound();

  const account = await prisma.account.findFirst({ where: { id } });
  if (!account) notFound();

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
          <CardTitle>Account settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>Name:</strong> {account.name}
          </p>
          {account.industry && (
            <p className="text-sm text-muted-foreground">
              <strong>Industry:</strong> {account.industry}
            </p>
          )}
          {account.timezone && (
            <p className="text-sm text-muted-foreground">
              <strong>Timezone:</strong> {account.timezone}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Branding (logo, primary color) and company info can be extended here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
