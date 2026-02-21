import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAccountScope } from "@/lib/tenant";
import { getAccessibleAccountIds } from "@/lib/account";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const scope = await getAccountScope();
  if (!scope) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-lg font-medium">No accounts assigned</p>
        <p className="text-sm text-muted-foreground">Contact your administrator to get access to an account.</p>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="text-sm text-primary underline">Sign out</button>
        </form>
      </div>
    );
  }

  const [clientsRaw, accountIds, accounts] = await Promise.all([
    prisma.client.findMany({
      where: { accountId: scope.accountId },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    getAccessibleAccountIds(session.sub, session.tenantId, session.isSuperAdmin ?? false),
    prisma.account.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const clients = clientsRaw.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
  const accessibleAccounts = accounts.filter((a) => accountIds.includes(a.id));

  return (
    <div className="flex h-screen flex-col">
      <Suspense fallback={<header className="h-14 border-b bg-background" />}>
        <DashboardShell
          clients={clients}
          currentAccountId={scope.accountId}
          accounts={accessibleAccounts}
        />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-muted/20 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
