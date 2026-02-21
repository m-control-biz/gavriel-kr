/**
 * Date range utilities used by the metrics layer and API routes.
 */

export type DateRange = { from: Date; to: Date };

/** Parse a range param like "7d", "30d", "90d", "12m" into a DateRange. */
export function dateRangeFromParam(param: string): DateRange {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let from: Date;

  if (param === "7d") {
    from = subDays(to, 6);
  } else if (param === "90d") {
    from = subDays(to, 89);
  } else if (param === "12m") {
    from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
  } else {
    // default 30d
    from = subDays(to, 29);
  }

  from.setHours(0, 0, 0, 0);
  return { from, to };
}

function subDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

/** Format a number as currency (USD). */
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format a number compactly: 1200 → "1.2K". */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Format a decimal like ROAS (2.4x). */
export function formatMultiplier(n: number): string {
  return `${n.toFixed(2)}x`;
}
