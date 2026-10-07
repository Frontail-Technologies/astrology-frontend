"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AdminPortalContainerProvider } from "@/components/providers/portal-container-provider";
import { getActiveAdminNavItem, getAdminPageTitle } from "../config/admin-navigation";
import { AdminMobileHeader } from "./admin-mobile-header";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = getActiveAdminNavItem(pathname);
  const isDirectoryLevel = active?.href === pathname;

  return (
    <SidebarProvider
      data-theme="admin"
      className="max-lg:[&_[data-slot=sidebar-gap]]:hidden max-lg:[&_[data-slot=sidebar-container]]:hidden!"
      style={{ "--sidebar-width-icon": "4rem" } as CSSProperties}
    >
      <AdminPortalContainerProvider>
        <AdminSidebar />
        <SidebarInset className="bg-background">
          <AdminMobileHeader title={getAdminPageTitle(active)} />
          <div className="min-h-svh bg-background px-4 py-5 sm:px-6 lg:px-8">
            <div
              className={`mx-auto w-full max-w-[1360px] ${
                isDirectoryLevel ? "max-lg:[&_h1]:sr-only" : ""
              }`}
            >
              {children}
            </div>
          </div>
        </SidebarInset>
      </AdminPortalContainerProvider>
    </SidebarProvider>
  );
}
