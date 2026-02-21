"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Global search input (UI only in Phase 1).
 * Phase 3: wire to full-text search + command palette.
 */
export function GlobalSearchInput({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search… (Phase 3)"
        className="pl-9 w-full max-w-sm bg-muted/50"
        readOnly
        aria-label="Global search"
      />
    </div>
  );
}
