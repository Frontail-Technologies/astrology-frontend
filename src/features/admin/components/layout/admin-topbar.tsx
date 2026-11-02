"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, LogOut, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getActiveAdminNavItem, getAdminPageTitle, getAdminSubpageLabel } from "../../config/admin-navigation";
import { useAdminAuth } from "../../auth/admin-auth-context";
import { AdminQuickNav, useQuickNavShortcut, useShortcutLabel } from "./admin-quick-nav";
import { AdminAvatar } from "./admin-user-identity";

function AdminUserMenu() {
  const { user, logout } = useAdminAuth();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-0.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:rounded-lg sm:py-1 sm:pl-1 sm:pr-2"
          aria-label={`Account menu for ${user?.email ?? "administrator"}`}
        >
          <AdminAvatar email={user?.email} />
          <span className="hidden max-w-44 truncate text-sm font-medium text-foreground xl:inline">{user?.email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-xs text-muted-foreground">Signed in as</span>
          <span className="block truncate text-sm font-medium text-foreground" title={user?.email ?? undefined}>
            {user?.email ?? "Administrator"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/" target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            Open public site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void logout().finally(() => router.replace("/admin/login"))}>
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Fixed admin top bar: sidebar toggle, page title (from the navigation config) with subtitle or breadcrumb,
 * quick-nav search and the account menu. The page's own `<h1>` stays in the content for assistive technology.
 */
export function AdminTopBar() {
  const pathname = usePathname();
  const active = getActiveAdminNavItem(pathname);
  const title = getAdminPageTitle(active);
  const subpage = getAdminSubpageLabel(pathname, active);
  const [searchOpen, setSearchOpen] = useState(false);
  const shortcut = useShortcutLabel();
  useQuickNavShortcut(setSearchOpen);

  return (
    <header className="sticky top-0 z-30 flex h-[var(--admin-topbar-height)] shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-surface/85 sm:gap-3 sm:px-5 lg:px-6">
      <SidebarTrigger className="size-9 text-muted-foreground hover:text-foreground" aria-label="Toggle navigation" title="Toggle navigation" />
      <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        {subpage && active ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm">
              {active.group !== title ? (
                <>
                  <li className="hidden shrink-0 text-muted-foreground md:block">{active.group}</li>
                  <li className="hidden md:block" aria-hidden="true">
                    <ChevronRight className="size-3.5 text-muted-foreground/70" />
                  </li>
                </>
              ) : null}
              <li className="min-w-0">
                <Link href={active.href} className="block truncate font-medium text-muted-foreground hover:text-foreground">
                  {title}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5 text-muted-foreground/70" />
              </li>
              <li className="shrink-0 font-semibold text-foreground" aria-current="page">
                {subpage}
              </li>
            </ol>
          </nav>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-5 tracking-tight text-foreground sm:text-base">{title}</p>
            {active?.description ? <p className="hidden truncate text-xs text-muted-foreground sm:block">{active.description}</p> : null}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setSearchOpen(true)}
        className="hidden h-9 w-64 justify-start gap-2 border-input bg-surface px-3 font-normal text-muted-foreground hover:bg-muted md:flex xl:w-72"
        aria-label="Search admin sections"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Search aria-hidden="true" />
        <span className="flex-1 text-left">Search sections…</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">{shortcut}</kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSearchOpen(true)}
        className="size-9 text-muted-foreground md:hidden"
        aria-label="Search admin sections"
      >
        <Search aria-hidden="true" />
      </Button>

      <AdminUserMenu />
      <AdminQuickNav open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
