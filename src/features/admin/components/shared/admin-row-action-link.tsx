import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/** Square icon-only link for table row actions (view, edit). `label` is the accessible name. */
export function AdminRowActionLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="inline-flex size-8 items-center justify-center rounded-[calc(var(--radius)-2px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={label}
    >
      <Icon className="size-4" aria-hidden="true" />
    </Link>
  );
}
