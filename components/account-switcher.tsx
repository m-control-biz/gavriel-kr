"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const COOKIE_NAME = "m_control_account";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setAccountCookie(accountId: string) {
  document.cookie = `${COOKIE_NAME}=${accountId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export type AccountOption = { id: string; name: string };

export function AccountSwitcher({
  accounts,
  currentAccountId,
  className,
}: {
  accounts: AccountOption[];
  currentAccountId: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const current = accounts.find((a) => a.id === currentAccountId) ?? accounts[0];

  const onSelect = (accountId: string) => {
    setAccountCookie(accountId);
    setOpen(false);
    router.refresh();
  };

  if (accounts.length <= 1) {
    return (
      <span className={cn("flex items-center gap-2 text-sm font-medium", className)}>
        <Building2 className="h-4 w-4 text-muted-foreground" />
        {current?.name ?? "Account"}
      </span>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[180px] justify-between", className)}
        >
          <Building2 className="h-4 w-4 shrink-0 opacity-70" />
          <span className="truncate">{current?.name ?? "Account"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]">
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => onSelect(account.id)}
          >
            {account.name}
            {account.id === currentAccountId ? " ✓" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
