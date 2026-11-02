"use client";

import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminPortalContainerProvider } from "@/components/providers/portal-container-provider";
import { cn } from "@/lib/utils";
import { getActiveAdminNavItem } from "../../config/admin-navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopBar } from "./admin-topbar";

type AdminShellContextValue = {
  /** True on a navigation item's own page (`/admin/customers`), where the top bar already shows the title. */
  isDirectoryLevel: boolean;
};

const AdminShellContext = createContext<AdminShellContextValue>({
  isDirectoryLevel: false,
});

export function useAdminShell() {
  return useContext(AdminShellContext);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = getActiveAdminNavItem(pathname);
  const isDirectoryLevel = active?.href === pathname;

  return (
    <SidebarProvider
      data-theme="admin"
      className="max-lg:[&_[data-slot=sidebar-gap]]:hidden max-lg:[&_[data-slot=sidebar-container]]:hidden!"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4rem",
        } as CSSProperties
      }
    >
      <AdminShellContext.Provider value={{ isDirectoryLevel }}>
        <AdminPortalContainerProvider>
          <a
            href="#admin-main"
            className="sr-only z-50 rounded-md bg-surface px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:ring-2 focus:ring-ring"
          >
            Skip to content
          </a>
          <AdminSidebar />
          <SidebarInset className="min-w-0 bg-background">
            <AdminTopBar />
            <div
              id="admin-main"
              tabIndex={-1}
              className="flex-1 px-4 pb-10 pt-5 outline-none sm:px-6 lg:px-8 lg:pt-6"
            >
              {/* On directory-level pages the top bar carries the visible title; page h1s stay for screen readers. */}
              <div
                className={cn(
                  "mx-auto w-full ",
                  isDirectoryLevel &&
                    "[&_h1:not([data-admin-visible-title])]:sr-only",
                )}
              >
                {children}
              </div>
            </div>
          </SidebarInset>
        </AdminPortalContainerProvider>
      </AdminShellContext.Provider>
    </SidebarProvider>
  );
}
