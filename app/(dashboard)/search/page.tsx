import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { search, getSavedSearches } from "@/lib/search";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Users, BarChart2, Clock } from "lucide-react";
import type { SearchModule } from "@/lib/search";

const MODULE_ICONS: Record<SearchModule, React.ElementType> = {
  alerts: AlertTriangle,
  clients: Users,
  metrics: BarChart2,
  leads: Users,
  reports: BarChart2,
  posts: BarChart2,
  articles: BarChart2,
  campaigns: BarChart2,
};

const MODULE_LABELS: Record<SearchModule, string> = {
  alerts: "Alert", clients: "Client", metrics: "Metric",
  leads: "Lead", reports: "Report", posts: "Post",
  articles: "Article", campaigns: "Campaign",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const params = await searchParams;
  const query = params.q ?? "";
  const source = params.source ?? null;

  const [results, savedSearches] = await Promise.all([
    query
      ? search({ tenantId: session.tenantId, query, source })
      : Promise.resolve({ items: [], total: 0 }),
    getSavedSearches(session.tenantId, session.sub),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        {query && (
          <p className="text-sm text-muted-foreground">
            {results.total} result{results.total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-2">
          {!query && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-medium">Use ⌘K to search</p>
                <p className="text-sm text-muted-foreground">
                  Search across alerts, clients, metrics and more
                </p>
              </CardContent>
            </Card>
          )}

          {query && results.items.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="font-medium">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-muted-foreground">Try different keywords</p>
              </CardContent>
            </Card>
          )}

          {results.items.map((item) => {
            const Icon = MODULE_ICONS[item.module] ?? Search;
            return (
              <a key={item.id} href={item.url} className="block">
                <Card className="transition-colors hover:bg-muted/40">
                  <CardContent className="flex items-center gap-4 py-4">
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.meta && (
                        <span className="text-xs text-muted-foreground">{item.meta}</span>
                      )}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {MODULE_LABELS[item.module]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* Saved searches sidebar */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Saved searches
          </h2>
          {savedSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved searches yet. Use ⌘K and click the bookmark icon.
            </p>
          ) : (
            savedSearches.map((s) => (
              <a
                key={s.id}
                href={`/search?q=${encodeURIComponent(s.query)}`}
                className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-muted transition-colors"
              >
                <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate">{s.name}</span>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
