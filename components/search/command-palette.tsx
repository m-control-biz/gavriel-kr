"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, AlertTriangle, Users, BarChart2, Clock, BookmarkPlus, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SearchResultItem, SearchModule } from "@/lib/search";

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
  alerts: "Alert",
  clients: "Client",
  metrics: "Metric",
  leads: "Lead",
  reports: "Report",
  posts: "Post",
  articles: "Article",
  campaigns: "Campaign",
};

type SavedSearch = { id: string; name: string; query: string };

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([]);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const [savingName, setSavingName] = React.useState("");
  const [showSave, setShowSave] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadSavedSearches();
    } else {
      setQuery("");
      setResults([]);
      setSelectedIdx(0);
      setShowSave(false);
    }
  }, [open]);

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.items ?? []);
        setSelectedIdx(0);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  async function loadSavedSearches() {
    try {
      const res = await fetch("/api/search/saved");
      const data = await res.json();
      setSavedSearches(data.items ?? []);
    } catch { setSavedSearches([]); }
  }

  async function handleSave() {
    if (!savingName.trim() || !query.trim()) return;
    await fetch("/api/search/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: savingName.trim(), query }),
    });
    setShowSave(false);
    setSavingName("");
    loadSavedSearches();
  }

  async function handleDeleteSaved(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/search/saved?id=${id}`, { method: "DELETE" });
    loadSavedSearches();
  }

  function handleSelect(item: SearchResultItem) {
    onOpenChange(false);
    router.push(item.url);
  }

  function handleSavedSelect(s: SavedSearch) {
    setQuery(s.query);
  }

  // Keyboard navigation
  const allItems = results;
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && allItems[selectedIdx]) { router.push(allItems[selectedIdx].url); onOpenChange(false); }
      if (e.key === "Escape") { onOpenChange(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, allItems, selectedIdx]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-2xl">
        <DialogTitle className="sr-only">Search</DialogTitle>

        {/* Search input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alerts, clients, metrics…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />}
          {query && (
            <button
              onClick={() => setShowSave(!showSave)}
              className="ml-2 rounded p-1 text-muted-foreground hover:text-foreground"
              title="Save this search"
            >
              <BookmarkPlus className="h-4 w-4" />
            </button>
          )}
          <kbd className="ml-3 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Save search form */}
        {showSave && (
          <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2">
            <input
              value={savingName}
              onChange={(e) => setSavingName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Name this search…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
            >
              Save
            </button>
          </div>
        )}

        <div className="max-h-[480px] overflow-y-auto">
          {/* Saved searches (shown when no query) */}
          {!query && savedSearches.length > 0 && (
            <div className="p-2">
              <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Saved searches
              </p>
              {savedSearches.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSavedSelect(s)}
                  className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 hover:bg-muted"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{s.name}</span>
                    <span className="text-xs text-muted-foreground">— {s.query}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSaved(s.id, e)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!query && savedSearches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">Search everything</p>
              <p className="text-xs text-muted-foreground">Alerts, clients, metrics and more</p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="p-2">
              <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Results ({results.length})
              </p>
              {results.map((item, idx) => {
                const Icon = MODULE_ICONS[item.module] ?? Search;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                      idx === selectedIdx ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      {item.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {MODULE_LABELS[item.module]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* No results */}
          {query && !loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-muted-foreground">Try different keywords</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 border-t bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
          <span><kbd className="rounded border bg-muted px-1">↑↓</kbd> navigate</span>
          <span><kbd className="rounded border bg-muted px-1">↵</kbd> open</span>
          <span><kbd className="rounded border bg-muted px-1">ESC</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
