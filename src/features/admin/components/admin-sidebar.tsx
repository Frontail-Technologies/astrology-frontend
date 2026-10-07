"use client";

import Link from "next/link";
import { CalendarDays, Calculator, CreditCard, LayoutDashboard, Package, Settings, Sparkles, Tags, TicketPercent, UsersRound, Images, ShoppingBag, Star, Bell, LifeBuoy, Newspaper, Sun, Database, MessagesSquare, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { adminNavigation, getActiveAdminNavItem } from "../config/admin-navigation";

const icons = {
  dashboard: LayoutDashboard,
  astrologers: UsersRound,
  poojas: Sparkles,
  calculators: Calculator,
  customers: UsersRound,
  consultations: CalendarDays,
  store: LayoutDashboard,
  products: Package,
  categories: Tags,
  banners: Images,
  coupons: TicketPercent,
  payments: CreditCard,
  settings: Settings,
  orders: ShoppingBag,
  reviews: Star,
  notifications: Bell,
  support: LifeBuoy,
  articles: Newspaper,
  horoscopes: Sun,
  masterData: Database,
  chats: MessagesSquare,
  reports: BarChart3,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const activeHref = getActiveAdminNavItem(pathname)?.href;
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="h-16 border-b border-sidebar-border bg-sidebar px-4 py-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-sm font-semibold tracking-tight">Astrology</span>
            <span className="block truncate text-xs text-sidebar-foreground/65">Admin</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 py-2">
        {adminNavigation.map((group) => (
          <SidebarGroup key={group.label} className="py-0.5">
            <SidebarGroupLabel className="h-6 px-3 text-[10px] font-bold uppercase tracking-wide text-sidebar-foreground/50">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const Icon = icons[item.icon];
                  const isActive = item.href === activeHref;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className="h-8 rounded-md px-3 text-xs font-medium transition-colors data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold hover:bg-sidebar-accent/60 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                      >
                        <Link href={item.href}>
                          <Icon aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="hidden border-t border-sidebar-border p-2.5 lg:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <SidebarTrigger
          className="size-8 self-end group-data-[collapsible=icon]:self-center"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        />
      </SidebarFooter>
    </Sidebar>
  );
}
