"use client";

import { AccountSwitcher, type AccountOption } from "@/components/account-switcher";
import { ClientSwitcher, type ClientOption } from "@/components/client-switcher";
import { GlobalSearchInput } from "@/components/global-search-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Topbar({
  clients,
  currentClientId,
  currentAccountId,
  accounts,
}: {
  clients: ClientOption[];
  currentClientId: string | null;
  currentAccountId: string;
  accounts: AccountOption[];
}) {
  const router = useRouter();

  const handleClientSelect = (clientId: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (clientId) params.set("client", clientId);
    else params.delete("client");
    const q = params.toString();
    router.push(q ? `${window.location.pathname}?${q}` : window.location.pathname);
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <GlobalSearchInput />
      <div className="flex-1" />
      <AccountSwitcher accounts={accounts} currentAccountId={currentAccountId} />
      <ClientSwitcher
        clients={clients}
        currentClientId={currentClientId}
        onSelect={handleClientSelect}
      />
      <ThemeToggle />
      <form action="/api/auth/logout" method="POST">
        <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </form>
    </header>
  );
}
