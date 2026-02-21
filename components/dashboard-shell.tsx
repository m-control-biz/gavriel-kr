"use client";

import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/topbar";
import type { ClientOption } from "@/components/client-switcher";

export function DashboardShell({ clients }: { clients: ClientOption[] }) {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client");
  const currentClientId =
    clientId && clients.some((c) => c.id === clientId) ? clientId : null;

  return <Topbar clients={clients} currentClientId={currentClientId} />;
}
