import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAccessibleAccountIds } from "@/lib/account";
import { listIntegrations } from "@/lib/integrations";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Plug } from "lucide-react";

export default async function AccountIntegrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const accountIds = await getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false);
  const { id } = await params;
  if (!accountIds.includes(id)) notFound();

  const account = await prisma.account.findFirst({ where: { id }, select: { name: true } });
  if (!account) notFound();

  const integrations = await listIntegrations(id);

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
            <Plug className="h-5 w-5" /> Integrations — {account.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {integrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No integrations connected. Connect from the main Integrations page for this account.</p>
          ) : (
            <ul className="space-y-2">
              {integrations.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="font-medium">{i.name ?? i.provider}</span>
                  <span className="text-xs text-muted-foreground">{i.provider}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/integrations">
            <Button variant="outline" size="sm" className="mt-4">Open Integrations</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
