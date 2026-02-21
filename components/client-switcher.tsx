"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ClientOption = {
  id: string;
  name: string;
  slug: string;
};

export function ClientSwitcher({
  clients,
  currentClientId,
  onSelect,
  className,
}: {
  clients: ClientOption[];
  currentClientId: string | null;
  onSelect: (clientId: string | null) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const current = clients.find((c) => c.id === currentClientId) ?? null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          {current ? current.name : "All clients"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuItem
          onClick={() => {
            onSelect(null);
            setOpen(false);
          }}
        >
          All clients
        </DropdownMenuItem>
        {clients.map((client) => (
          <DropdownMenuItem
            key={client.id}
            onClick={() => {
              onSelect(client.id);
              setOpen(false);
            }}
          >
            {client.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
