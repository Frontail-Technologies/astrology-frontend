"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StoreSearch({ className, onSubmitted }: { className?: string; onSubmitted?: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const q = query.trim();
        router.push(q ? `/shop/search?q=${encodeURIComponent(q)}` : "/shop/search");
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
        className="h-12 w-full rounded-lg bg-surface pl-11 pr-28 text-base shadow-sm"
      />
      <Button type="submit" size="sm" variant="conversion" className="absolute right-1.5 top-1/2 h-9 min-h-9 -translate-y-1/2 px-5">
        Search
      </Button>
    </form>
  );
}
