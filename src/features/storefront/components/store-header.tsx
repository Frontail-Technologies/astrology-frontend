"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  Moon,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { BrandMark } from "@/components/layout/public-header";
import { Container } from "@/components/layout/container";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { storeUtilityMessages } from "../content/store-content";
import { useStorefrontCatalog } from "../hooks/use-storefront-catalog";
import { StoreCartButton } from "./store-cart-button";
import { StoreSearch } from "./store-search";

/** Phase 2 owns these destinations. Rendered inert so there is no dead link. */
function ComingSoonAction({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span title={`${label} is coming soon`} className="inline-flex">
      <Button
        variant="ghost"
        disabled
        aria-label={`${label} (coming soon)`}
        className="h-10 min-h-10 gap-2 px-2.5"
      >
        <Icon aria-hidden="true" />
        <span className="hidden text-sm font-medium xl:inline">{label}</span>
      </Button>
    </span>
  );
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-10"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}

function StoreBrand() {
  return (
    <Link
      href="/shop"
      className="group flex shrink-0 items-center gap-2.5"
      aria-label="Astrology Store home"
    >
      <BrandMark />
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold text-foreground">
          Astrology
        </span>
        <span className="block pt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Store
        </span>
      </span>
    </Link>
  );
}

export function StoreHeader() {
  const pathname = usePathname();
  const { categories } = useStorefrontCatalog();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/shop",
      label: "Shop",
      active: pathname === "/shop" || pathname.startsWith("/shop/search"),
    },
    ...categories.map((category) => ({
      href: `/shop/category/${category.slug}`,
      label: category.name,
      active: pathname === `/shop/category/${category.slug}`,
    })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <Container className="max-w-[1440px]">
        <div className="flex h-16 items-center justify-between gap-3 md:gap-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 md:hidden"
                aria-label="Open store menu"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b border-border p-4">
                <SheetTitle className="text-base">Store menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Store categories" className="p-2">
                <ul>
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={item.active ? "page" : undefined}
                        className={cn(
                          "block rounded-md px-3 py-3 text-sm font-medium hover:bg-surface-muted",
                          item.active && "bg-surface-muted text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 border-t border-border pt-2">
                  <Link
                    href={storeUtilityMessages.helpHref}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-3 text-sm hover:bg-surface-muted"
                  >
                    Talk to an astrologer
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-md px-3 py-3 text-sm hover:bg-surface-muted"
                  >
                    Astrology home
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <StoreBrand />

          <StoreSearch className="hidden max-w-2xl flex-1 md:flex" />

          <div className="ml-auto flex items-center md:ml-0">
            <ThemeButton />
            <ComingSoonAction icon={UserRound} label="Account" />
            <span className="hidden sm:inline-flex">
              <ComingSoonAction icon={Heart} label="Wishlist" />
            </span>
            <StoreCartButton />
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <StoreSearch />
        </div>
      </Container>

      <nav
        aria-label="Store categories"
        className="hidden border-t border-border md:block"
      >
        <Container className="max-w-[1440px]">
          <ul className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 items-center border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    item.active && "border-conversion-500 text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </header>
  );
}
