"use client";

import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export type SectionNavItem = { id: string; label: string };

type SectionNavProps = {
  items: SectionNavItem[];
  ariaLabel?: string;
  containerClassName?: string;
};

/**
 * Shared sticky in-page section navigation with scroll-spy. Sits directly under
 * the sticky public header. Horizontally scrollable (scrollbar hidden) on mobile.
 * Uses buttons + `scrollIntoView` — no `href="#"`.
 */
export function SectionNav({
  items,
  ariaLabel = "Page sections",
  containerClassName = "max-w-[1320px]",
}: SectionNavProps) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="sticky top-16 z-30 border-b border-gold-500/16 bg-ivory-50/92 backdrop-blur dark:border-gold-400/14 dark:bg-obsidian-950/90 lg:top-[72px]"
    >
      <Container className={containerClassName}>
        <ul className="no-scrollbar flex gap-1 overflow-x-auto py-1">
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative inline-flex h-11 items-center px-3 text-sm font-medium outline-none transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-conversion-500 after:transition-transform after:duration-200",
                    isActive
                      ? "font-semibold text-foreground after:scale-x-100"
                      : "text-foreground/65 after:scale-x-0 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
