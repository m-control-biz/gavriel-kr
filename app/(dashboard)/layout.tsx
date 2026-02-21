import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
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

  const clients = await prisma.client
    .findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    })
    .then((rows) => rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug })));

  return (
    <div className="flex h-screen flex-col">
      <Suspense fallback={<header className="h-14 border-b bg-background" />}>
        <DashboardShell clients={clients} />
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
