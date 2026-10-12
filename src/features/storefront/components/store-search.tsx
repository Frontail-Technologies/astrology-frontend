"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StoreSearch({
  className,
  onSubmitted,
}: {
  className?: string;
  onSubmitted?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      className={cn(
        "relative flex h-12 w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-lg border border-input bg-surface p-1 shadow-sm",
        className,
      )}
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        router.push(
          q ? `/shop/search?q=${encodeURIComponent(q)}` : "/shop/search",
        );
        onSubmitted?.();
      }}
    >
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search rudraksha, gemstones, remedies..."
        aria-label="Search the store"
        className="h-full min-w-0 flex-1 truncate border-0 bg-transparent pl-10 pr-2 text-base shadow-none placeholder:truncate focus-visible:ring-0"
      />
      <Button
        type="submit"
        size="sm"
        variant="conversion"
        className="h-10 min-h-10 w-[92px] shrink-0 px-3"
      >
        Search
      </Button>
    </form>
  );
}
