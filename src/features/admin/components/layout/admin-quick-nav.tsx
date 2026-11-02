"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { adminNavigation } from "../../config/admin-navigation";
import { adminNavIcons } from "./admin-nav-icons";

type QuickNavEntry = { href: string; label: string; group: string; description: string; icon: (typeof adminNavigation)[number]["items"][number]["icon"] };

const entries: QuickNavEntry[] = adminNavigation.flatMap((group) =>
  group.items.map((item) => ({
    href: item.href,
    label: item.label === "Overview" ? `${group.label} overview` : item.label,
    group: group.label,
    description: item.description,
    icon: item.icon,
  })),
);

function matches(entry: QuickNavEntry, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [entry.label, entry.group, entry.description].some((text) => text.toLowerCase().includes(q));
}

/** Platform-aware shortcut hint ("⌘K" on Apple devices, "Ctrl K" elsewhere). */
const noSubscribe = () => () => {};
function useShortcutLabel() {
  const apple = useSyncExternalStore(noSubscribe, () => /Mac|iPhone|iPad/.test(navigator.platform), () => false);
  return apple ? "⌘K" : "Ctrl K";
}

/**
 * Quick navigation over the admin sections (client-side only, no data). Opens from the top-bar search button,
 * Ctrl/⌘+K, or "/" when focus is not in a field. Arrow keys move, Enter opens.
 */
export function AdminQuickNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Label matches first (prefix before substring), then group/description matches.
    const rank = (entry: QuickNavEntry) => {
      const label = entry.label.toLowerCase();
      if (!q) return 0;
      if (label.startsWith(q)) return 0;
      if (label.includes(q)) return 1;
      if (entry.group.toLowerCase().includes(q)) return 2;
      return 3;
    };
    return entries
      .filter((entry) => matches(entry, query))
      .map((entry, index) => ({ entry, index, score: rank(entry) }))
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .map(({ entry }) => entry);
  }, [query]);
  const safeIndex = Math.min(activeIndex, Math.max(results.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${safeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [safeIndex]);

  const close = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setQuery("");
      setActiveIndex(0);
    }
  };

  const go = (entry: QuickNavEntry | undefined) => {
    if (!entry) return;
    close(false);
    router.push(entry.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((safeIndex + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((safeIndex - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[safeIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent showCloseButton={false} className="top-[12vh] max-w-[calc(100%-2rem)] translate-y-0 gap-0 overflow-hidden rounded-xl p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Go to a section</DialogTitle>
        <DialogDescription className="sr-only">Type to filter admin sections, use the arrow keys to choose and Enter to open.</DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            data-admin-bare-input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Go to customers, orders, payouts…"
            className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[safeIndex] ? `${listId}-${safeIndex}` : undefined}
            aria-autocomplete="list"
            aria-label="Search admin sections"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">Esc</kbd>
        </div>
        <ul ref={listRef} id={listId} role="listbox" aria-label="Admin sections" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">No section matches “{query.trim()}”.</li>
          ) : (
            results.map((entry, index) => {
              const Icon = adminNavIcons[entry.icon];
              const selected = index === safeIndex;
              return (
                <li
                  key={entry.href}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={selected}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => go(entry)}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5", selected && "bg-muted")}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{entry.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{entry.description}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{entry.group}</span>
                  {selected ? <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
                </li>
              );
            })
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

/** Registers Ctrl/⌘+K and "/" to open the quick nav. */
export function useQuickNavShortcut(setOpen: (open: boolean) => void) {
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}

export { useShortcutLabel };
