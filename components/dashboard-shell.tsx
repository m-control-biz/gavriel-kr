"use client";

import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/topbar";
import type { ClientOption } from "@/components/client-switcher";
import type { AccountOption } from "@/components/account-switcher";

export function DashboardShell({
  clients,
  currentAccountId,
  accounts,
}: {
  clients: ClientOption[];
  currentAccountId: string;
  accounts: AccountOption[];
}) {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client");
  const currentClientId =
    clientId && clients.some((c) => c.id === clientId) ? clientId : null;

  return (
    <Topbar
      clients={clients}
      currentClientId={currentClientId}
      currentAccountId={currentAccountId}
      accounts={accounts}
    />
  );
}
