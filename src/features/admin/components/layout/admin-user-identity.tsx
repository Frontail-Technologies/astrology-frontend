"use client";

import { cn } from "@/lib/utils";

/** Initials from an email local part: `priya.sharma@x` -> "PS", `admin@x` -> "AD". */
export function adminInitials(email: string | null | undefined): string {
  const local = (email ?? "").split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (local.slice(0, 2) || "A").toUpperCase();
}

/** Round initials avatar for the signed-in admin (no photo source exists for admins). */
export function AdminAvatar({ email, className }: { email: string | null | undefined; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-[var(--admin-nav-raised)] text-[11px] font-semibold tracking-wide text-gold-300 ring-1 ring-gold-500/40",
        className,
      )}
    >
      {adminInitials(email)}
    </span>
  );
}
