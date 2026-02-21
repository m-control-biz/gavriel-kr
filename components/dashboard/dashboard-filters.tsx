"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, ChevronDown } from "lucide-react";

export const DATE_RANGES = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 12 months", value: "12m" },
] as const;

export type DateRangeValue = (typeof DATE_RANGES)[number]["value"];

export function DashboardFilters({
  sources,
}: {
  sources: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const range = (searchParams.get("range") as DateRangeValue) ?? "30d";
  const source = searchParams.get("source") ?? "";

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentRange = DATE_RANGES.find((d) => d.value === range) ?? DATE_RANGES[1];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date range picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            {currentRange.label}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {DATE_RANGES.map((d) => (
            <DropdownMenuItem key={d.value} onClick={() => update("range", d.value)}>
              {d.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Source filter */}
      {sources.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Source: {source || "All"}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => update("source", "")}>All</DropdownMenuItem>
            {sources.map((s) => (
              <DropdownMenuItem key={s} onClick={() => update("source", s)}>
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
