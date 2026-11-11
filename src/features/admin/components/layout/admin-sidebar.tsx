"use client";

import Link from "next/link";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { adminNavigation, getActiveAdminNavItem } from "../../config/admin-navigation";
import { useAdminAuth } from "../../auth/admin-auth-context";
import { adminNavIcons } from "./admin-nav-icons";
import { AdminAvatar } from "./admin-user-identity";

const GROUPS_STORAGE_KEY = "admin.nav.groups";
/** Groups that are always expanded (no toggle). */
const PINNED_GROUPS = new Set<string>(["Overview"]);

function readGroupState(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(GROUPS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeGroupState(state: Record<string, boolean>) {
  try {
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode); the sidebar still works without remembering.
  }
}

/** Small gold celestial mark: a ring with a four-point star. The only ornament in the admin shell. */
function BrandMark() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--admin-nav-raised)] ring-1 ring-gold-500/35">
      <svg viewBox="0 0 24 24" className="size-5 text-gold-400" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1" opacity="0.55" />
        <path d="M12 5.5 13.3 10.7 18.5 12 13.3 13.3 12 18.5 10.7 13.3 5.5 12 10.7 10.7Z" fill="currentColor" />
      </svg>
    </span>
  );
}

const itemClass =
  "relative h-9 gap-3 rounded-md px-3 text-[13px] font-medium text-sidebar-foreground transition-colors " +
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground " +
  "data-[active=true]:bg-white/[0.08] data-[active=true]:font-semibold data-[active=true]:text-sidebar-accent-foreground " +
  "data-[active=true]:before:absolute data-[active=true]:before:inset-y-1.5 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-gold-400 " +
  "[&>svg]:text-[var(--admin-nav-muted)] data-[active=true]:[&>svg]:text-gold-300 hover:[&>svg]:text-sidebar-accent-foreground " +
  "focus-visible:ring-2 focus-visible:ring-sidebar-ring " +
  "group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:before:hidden";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAdminAuth();
  const active = getActiveAdminNavItem(pathname);
  const activeHref = active?.href;
  const activeGroup = active?.group;
  const { setOpenMobile, state, isMobile } = useSidebar();
  const iconMode = state === "collapsed" && !isMobile;
  // The shell renders only after the client-side auth check, so reading storage here never runs on the server.
  const [groupState, setGroupState] = useState<Record<string, boolean>>(() => (typeof window === "undefined" ? {} : readGroupState()));

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const isGroupOpen = useCallback(
    (label: string) => PINNED_GROUPS.has(label) || label === activeGroup || (groupState[label] ?? false),
    [activeGroup, groupState],
  );

  const toggleGroup = (label: string, open: boolean) => {
    setGroupState((current) => {
      const next = { ...current, [label]: open };
      writeGroupState(next);
      return next;
    });
  };

  const signOut = () => void logout().finally(() => router.replace("/admin/login"));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="h-[var(--admin-topbar-height)] justify-center border-b border-sidebar-border px-4 py-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link
          href="/admin"
          className="flex items-center gap-3 overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label="Astrology admin, dashboard"
        >
          <BrandMark />
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate font-display text-lg font-semibold leading-5 text-ivory-50">Astrology</span>
            <span className="block truncate text-[11px] font-medium text-[var(--admin-nav-muted)]">Admin console</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2.5 py-3">
        <nav aria-label="Admin">
          {adminNavigation.map((group, index) => {
            const pinned = PINNED_GROUPS.has(group.label);
            const open = iconMode || isGroupOpen(group.label);
            const containsActive = group.label === activeGroup;
            const menu = (
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const Icon = adminNavIcons[item.icon];
                  const isActive = item.href === activeHref;
                  const label = item.label === "Overview" ? `${group.label} overview` : item.label;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={label} className={itemClass}>
                        <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                          <Icon aria-hidden="true" />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            );

            return (
              <SidebarGroup key={group.label} className="p-0">
                {index > 0 ? <SidebarSeparator className="mx-1 my-2 hidden bg-sidebar-border group-data-[collapsible=icon]:block" /> : null}
                {pinned || iconMode ? (
                  <SidebarGroupContent className={cn(index > 0 && "mt-1")}>{menu}</SidebarGroupContent>
                ) : (
                  <Collapsible open={open} onOpenChange={(next) => toggleGroup(group.label, next)} className="mt-3">
                    <CollapsibleTrigger
                      className="group/trigger flex h-8 w-full items-center justify-between rounded-md px-3 text-xs font-semibold text-[var(--admin-nav-muted)] outline-none transition-colors hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                    >
                      <span className="flex items-center gap-2">
                        {group.label}
                        {containsActive && !open ? <span className="size-1.5 rounded-full bg-gold-400" aria-hidden="true" /> : null}
                      </span>
                      <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]/trigger:-rotate-90" aria-hidden="true" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarGroupContent className="pt-0.5">{menu}</SidebarGroupContent>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </SidebarGroup>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <div className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]:hidden">
          <AdminAvatar email={user?.email} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ivory-50" title={user?.email ?? undefined}>
              {user?.displayName || user?.email || "Signed in"}
            </p>
            <p className="text-[11px] text-[var(--admin-nav-muted)]">Administrator</p>
          </div>
          <Link
            href="/admin/change-password"
            className="grid size-9 shrink-0 place-items-center rounded-md text-[var(--admin-nav-muted)] outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label="Change password"
            title="Change password"
          >
            <KeyRound className="size-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="grid size-9 shrink-0 place-items-center rounded-md text-[var(--admin-nav-muted)] outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label="Sign out"
            title="Sign out"
            onClick={signOut}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          className="hidden size-9 place-items-center rounded-md text-[var(--admin-nav-muted)] outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:grid"
          aria-label="Sign out"
          title="Sign out"
          onClick={signOut}
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
