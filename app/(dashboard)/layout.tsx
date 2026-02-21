import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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

  // #region agent log
  let clients: { id: string; name: string; slug: string }[] = [];
  let accessibleAccounts: { id: string; name: string }[] = [];
  try {
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
    clients = clientsRaw.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
    accessibleAccounts = accounts.filter((a) => accountIds.includes(a.id));
    fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:B',message:'Promise.all OK',data:{clientsCount:clients.length,accountsCount:accessibleAccounts.length,accountId:scope.accountId},hypothesisId:'B-C-D',timestamp:Date.now()})}).catch(()=>{});
  } catch (err) {
    console.error("[layout] Promise.all failed — hypothesisId B/C/D:", err);
    fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:B',message:'Promise.all FAILED',data:{error:String(err)},hypothesisId:'B-C-D',timestamp:Date.now()})}).catch(()=>{});
  }
  // #endregion

  // #region agent log — hypothesis A: cookies().set() in server component
  try {
    const cookieStore = await cookies();
    const existing = cookieStore.get("m_control_account")?.value;
    fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:A',message:'before cookieStore.set',data:{existing,target:scope.accountId},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    if (existing !== scope.accountId) {
      cookieStore.set("m_control_account", scope.accountId, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:A',message:'after cookieStore.set — succeeded',hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
    }
  } catch (err) {
    console.error("[layout] cookies().set() FAILED — hypothesis A CONFIRMED:", err);
    fetch('http://127.0.0.1:7244/ingest/b59fcf8e-45dc-4868-b7f9-c7f06467e86e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:A',message:'cookies().set() THREW — hyp A CONFIRMED',data:{error:String(err)},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
  }
  // #endregion

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
