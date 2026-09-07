"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BadgeCheck,
  BookOpen,
  Calculator,
  CalendarDays,
  Check,
  Flame,
  Globe2,
  HeartHandshake,
  Menu,
  Moon,
  Orbit,
  Sparkles,
  Sun,
  UserRound,
  X
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  useSidebar
} from "@/components/ui/sidebar"
import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import { Container } from "./container"

type PublicNavItem = {
  label: string
  href: string
  status: "implemented" | "planned"
  group: "discover" | "consult" | "more"
  icon: typeof Sparkles
}

type LanguageOption = {
  value: "en" | "hi"
  label: string
  shortLabel: string
  enabled: boolean
}

const publicNavItems: PublicNavItem[] = [
  {
    label: "Horoscope",
    href: "/horoscope",
    status: "planned",
    group: "discover",
    icon: Sun
  },
  {
    label: "Kundli",
    href: "/kundli",
    status: "planned",
    group: "discover",
    icon: Orbit
  },
  {
    label: "Compatibility",
    href: "/compatibility",
    status: "planned",
    group: "discover",
    icon: HeartHandshake
  },
  {
    label: "Panchang",
    href: "/panchang",
    status: "planned",
    group: "discover",
    icon: CalendarDays
  },
  {
    label: "Calculators",
    href: "/calculators",
    status: "implemented",
    group: "discover",
    icon: Calculator
  },
  {
    label: "Online Pooja",
    href: "/pooja",
    status: "implemented",
    group: "discover",
    icon: Flame
  },
  {
    label: "Astrologers",
    href: "/astrologers",
    status: "implemented",
    group: "consult",
    icon: BadgeCheck
  },
  {
    label: "Articles",
    href: "/articles",
    status: "planned",
    group: "more",
    icon: BookOpen
  }
]

const signInItem = {
  label: "Sign In",
  href: "/sign-in",
  status: "planned" as const,
  group: "more" as const,
  icon: UserRound
}

const languageOptions: LanguageOption[] = [
  {
    value: "en",
    label: "English",
    shortLabel: "EN",
    enabled: true
  },
  {
    value: "hi",
    label: "हिन्दी",
    shortLabel: "HI",
    enabled: false
  }
]

const currentLanguage = languageOptions[0]

function isActive(pathname: string, item: PublicNavItem) {
  return item.status === "implemented" && pathname === item.href
}

export function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-9 place-items-center rounded-full text-gold-300 transition-transform duration-300 ease-out group-hover:rotate-[8deg] group-focus-visible:rotate-[8deg]"
    >
      <span className="absolute inset-0 rounded-full border border-gold-400/45" />
      <span className="absolute size-6 rotate-45 rounded-full border border-gold-400/25" />
      <span className="absolute right-0.5 top-1 size-1.5 rounded-full bg-gold-400 shadow-[0_0_8px_color-mix(in_srgb,var(--gold-400)_45%,transparent)]" />
      <span className="grid size-4 place-items-center text-gold-300 transition-colors duration-300 group-hover:text-gold-400 group-focus-visible:text-gold-400">
        <span className="absolute h-4 w-px bg-current" />
        <span className="absolute h-px w-4 bg-current" />
        <span className="absolute h-3 w-px rotate-45 bg-current opacity-75" />
        <span className="absolute h-px w-3 rotate-45 bg-current opacity-75" />
      </span>
    </span>
  )
}

function Brand() {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3 rounded-md text-foreground outline-none transition-colors duration-300 hover:text-gold-500 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "dark:text-ivory-50 dark:hover:text-gold-300"
      )}
      aria-label="Astrology home"
    >
      <BrandMark />
      <span className="font-display text-2xl font-semibold leading-none tracking-normal">
        Astrology
      </span>
    </Link>
  )
}

function DesktopNavItem({ item }: { item: PublicNavItem }) {
  const pathname = usePathname()
  const active = isActive(pathname, item)

  const className = cn(
    "group relative inline-flex h-10 items-center rounded-md px-1 text-[15px] font-medium outline-none transition-colors duration-200 ease-out",
    "text-foreground/65 hover:text-foreground dark:text-ivory-50/70 dark:hover:text-ivory-50",
    "focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "after:absolute after:inset-x-1 after:bottom-1 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-conversion-500 after:transition-transform after:duration-200 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100",
    active && "font-semibold text-foreground after:scale-x-100 dark:text-ivory-50",
    item.status === "planned" && "cursor-default"
  )

  const labelClassName =
    "inline-block translate-y-0 transition-transform duration-[250ms] ease-out group-hover:-translate-y-px group-focus-visible:-translate-y-px"

  if (item.status === "implemented") {
    return (
      <Link className={className} href={item.href} aria-current={active ? "page" : undefined}>
        <span className={labelClassName}>{item.label}</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-disabled="true"
      title={`${item.label} route is planned for a later screen`}
    >
      <span className={labelClassName}>{item.label}</span>
    </button>
  )
}

function ThemeUtilityButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const Icon = theme === "dark" ? Sun : Moon
  const nextTheme = theme === "dark" ? "light" : "dark"

  return (
    <Button
      aria-label={`Switch to ${nextTheme} mode`}
      className={cn(
        "size-10 bg-transparent p-0 transition-transform duration-200 hover:-translate-y-px hover:text-gold-500",
        "text-foreground/70 hover:bg-gold-300/20 focus-visible:ring-offset-background",
        "dark:text-ivory-50/80 dark:hover:bg-espresso-700 dark:hover:text-gold-300",
        className
      )}
      onClick={toggleTheme}
      size="icon"
      title={`Switch to ${nextTheme} mode`}
      type="button"
      variant="ghost"
    >
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  )
}

function LanguageDropdown({
  triggerClassName,
  align = "end",
  variant = "desktop"
}: {
  triggerClassName?: string
  align?: "start" | "center" | "end"
  variant?: "desktop" | "mobile"
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Select language. Current language: ${currentLanguage.label}.`}
          className={cn(
            variant === "desktop" &&
              cn(
                "h-10 bg-transparent px-2.5 transition-transform duration-200 hover:-translate-y-px",
                "text-foreground/75 hover:bg-gold-300/20 hover:text-foreground focus-visible:ring-offset-background",
                "dark:text-ivory-50/85 dark:hover:bg-espresso-700 dark:hover:text-ivory-50"
              ),
            variant === "mobile" &&
              "group min-h-12 w-full justify-start gap-3 rounded-md border-transparent bg-transparent px-3 text-left text-sm font-medium text-foreground/80 hover:bg-gold-300/15 hover:text-foreground focus-visible:bg-gold-300/15 focus-visible:ring-offset-background dark:text-ivory-50/82 dark:hover:bg-espresso-800 dark:hover:text-ivory-50 dark:focus-visible:bg-espresso-800 dark:focus-visible:ring-offset-obsidian-950",
            triggerClassName
          )}
          title="Select language"
          type="button"
          variant="ghost"
        >
          {variant === "desktop" ? (
            <>
              <Globe2 className="size-4 text-gold-300" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-[0.08em]">
                {currentLanguage.shortLabel}
              </span>
            </>
          ) : (
            <>
              <span className="grid size-8 place-items-center rounded-md bg-gold-300/20 text-gold-500 transition-colors duration-[250ms] group-hover:bg-gold-300/35 group-focus-visible:bg-gold-300/35 dark:bg-espresso-900/70 dark:text-gold-300 dark:group-hover:bg-espresso-700 dark:group-hover:text-gold-400 dark:group-focus-visible:bg-espresso-800 dark:group-focus-visible:text-gold-400">
                <Globe2 className="size-4" aria-hidden="true" />
              </span>
              <span className="flex flex-1 translate-x-0 items-center justify-between transition-transform duration-[250ms] ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
                <span>Language</span>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-gold-500 dark:text-gold-300">
                  {currentLanguage.shortLabel}
                </span>
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(
          "min-w-36 border-gold-400/20 shadow-md",
          "bg-popover text-popover-foreground"
        )}
      >
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400/80">
          Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gold-400/15" />
        {languageOptions.map((option) => {
          const active = option.value === currentLanguage.value

          return (
            <DropdownMenuItem
              className={cn(
                "gap-3 rounded-md data-[disabled]:opacity-45",
                "text-popover-foreground/82 focus:bg-accent focus:text-popover-foreground"
              )}
              disabled={!option.enabled}
              key={option.value}
              title={option.enabled ? option.label : "Localization preview only"}
            >
              <span className="flex-1">{option.label}</span>
              {active && <Check className="size-4 text-gold-400" aria-hidden="true" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TalkToAstrologerCta({ className }: { className?: string }) {
  return (
    <Button
      aria-disabled="true"
      className={cn(
        "h-10 min-h-10 px-4 text-sm transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_18px_color-mix(in_srgb,var(--conversion-500)_20%,transparent)] focus-visible:ring-offset-obsidian-950",
        className
      )}
      title="Talk to Astrologer route is planned for a later screen"
      type="button"
      variant="conversion"
    >
      Talk to Astrologer
    </Button>
  )
}

function MobileMenuRow({ item }: { item: PublicNavItem | typeof signInItem }) {
  const Icon = item.icon
  const { setOpen, setOpenMobile } = useSidebar()
  const className = cn(
    "group relative flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-foreground/80 outline-none transition-colors duration-[250ms] ease-out dark:text-ivory-50/82",
    "hover:bg-gold-300/15 hover:text-foreground focus-visible:bg-gold-300/15 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:bg-espresso-800 dark:hover:text-ivory-50 dark:focus-visible:bg-espresso-800 dark:focus-visible:text-ivory-50 dark:focus-visible:ring-offset-obsidian-950",
    item.status === "planned" && "cursor-default"
  )

  const content = (
    <>
      <span className="grid size-8 place-items-center rounded-md bg-gold-300/20 text-gold-500 transition-colors duration-[250ms] group-hover:bg-gold-300/35 group-focus-visible:bg-gold-300/35 dark:bg-espresso-900/70 dark:text-gold-300 dark:group-hover:bg-espresso-700 dark:group-hover:text-gold-400 dark:group-focus-visible:bg-espresso-800 dark:group-focus-visible:text-gold-400">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="translate-x-0 transition-transform duration-[250ms] ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
        {item.label}
      </span>
    </>
  )

  if (item.status === "implemented") {
    return (
      <Link
        className={className}
        href={item.href}
        onClick={() => {
          setOpen(false)
          setOpenMobile(false)
        }}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-disabled="true"
      title={`${item.label} route is planned for a later screen`}
    >
      {content}
    </button>
  )
}

function MobileSidebarCloseButton() {
  const { setOpen, setOpenMobile } = useSidebar()

  return (
    <button
      type="button"
      aria-label="Close navigation menu"
      className="grid size-9 place-items-center rounded-md border border-gold-500/25 bg-white/50 text-foreground/70 transition-colors duration-[200ms] hover:bg-gold-300/20 hover:text-gold-500 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-gold-400/24 dark:bg-obsidian-950/30 dark:text-ivory-50/72 dark:hover:bg-espresso-700 dark:hover:text-gold-300 dark:focus-visible:ring-offset-obsidian-950"
      onClick={() => {
        setOpen(false)
        setOpenMobile(false)
      }}
    >
      <X className="size-4" aria-hidden="true" />
    </button>
  )
}

function MobileSidebarOpenButton() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      aria-label="Open navigation menu"
      className={cn(
        "size-10 border-gold-400/35 p-0 transition-all duration-[250ms] hover:-translate-y-px hover:border-gold-400/65 hover:text-gold-300",
        "bg-white/55 text-foreground hover:bg-gold-300/18 focus-visible:ring-offset-background",
        "dark:bg-espresso-900/55 dark:text-ivory-50 dark:hover:bg-espresso-700"
      )}
      onClick={toggleSidebar}
      size="icon"
      variant="outline"
    >
      <Menu className="size-5" aria-hidden="true" />
    </Button>
  )
}

function MobileUtilityRows() {
  return (
    <div className="space-y-1">
      <MobileThemeRow />
      <div className="px-0">
        <LanguageDropdown
          align="start"
          variant="mobile"
        />
      </div>
    </div>
  )
}

function MobileThemeRow() {
  const { theme, toggleTheme } = useTheme()
  const Icon = theme === "dark" ? Sun : Moon
  const nextTheme = theme === "dark" ? "light" : "dark"

  return (
    <button
      type="button"
      className="group relative flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-foreground/80 outline-none transition-colors duration-[250ms] ease-out hover:bg-gold-300/15 hover:text-foreground focus-visible:bg-gold-300/15 focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-ivory-50/82 dark:hover:bg-espresso-800 dark:hover:text-ivory-50 dark:focus-visible:bg-espresso-800 dark:focus-visible:text-ivory-50 dark:focus-visible:ring-offset-obsidian-950"
      aria-label={`Switch to ${nextTheme} mode`}
      onClick={toggleTheme}
      title={`Switch to ${nextTheme} mode`}
    >
      <span className="grid size-8 place-items-center rounded-md bg-gold-300/20 text-gold-500 transition-colors duration-[250ms] group-hover:bg-gold-300/35 group-focus-visible:bg-gold-300/35 dark:bg-espresso-900/70 dark:text-gold-300 dark:group-hover:bg-espresso-700 dark:group-hover:text-gold-400 dark:group-focus-visible:bg-espresso-800 dark:group-focus-visible:text-gold-400">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="translate-x-0 transition-transform duration-[250ms] ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
        Theme
      </span>
    </button>
  )
}

function MobileNavGroup({
  label,
  items
}: {
  label: string
  items: Array<PublicNavItem | typeof signInItem>
}) {
  return (
    <div className="space-y-2">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400/82">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <MobileMenuRow item={item} key={item.href} />
        ))}
      </div>
    </div>
  )
}

function MobilePublicMenu() {
  const discoverItems = publicNavItems.filter((item) => item.group === "discover")
  const consultItems = publicNavItems.filter((item) => item.group === "consult")
  const moreItems = [...publicNavItems.filter((item) => item.group === "more"), signInItem]

  return (
    <SidebarProvider
      defaultOpen={false}
      className="contents min-h-0 w-auto"
      style={
        {
          "--sidebar-width": "22.5rem",
          "--sidebar-width-icon": "3rem"
        } as CSSProperties
      }
    >
      <MobileSidebarOpenButton />
      <Sidebar
        className="z-50 border-l border-gold-500/20 bg-ivory-50 text-foreground shadow-2xl shadow-obsidian-950/15 dark:border-gold-400/20 dark:bg-obsidian-950 dark:text-ivory-50 dark:shadow-obsidian-950/45"
        collapsible="offcanvas"
        side="right"
        variant="sidebar"
      >
        <SidebarHeader className="relative overflow-hidden border-b border-gold-500/16 bg-ivory-100 px-5 py-5 text-left dark:border-gold-400/16 dark:bg-espresso-900">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-14 size-32 rounded-full border border-gold-500/12 dark:border-gold-400/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full border border-gold-500/12 dark:border-gold-400/10"
          />
          <div className="relative flex items-center justify-between gap-3 text-foreground dark:text-ivory-50">
            <span className="flex min-w-0 items-center gap-3">
              <BrandMark />
              <span className="truncate font-display text-2xl font-semibold leading-none">
                Astrology
              </span>
            </span>
            <MobileSidebarCloseButton />
          </div>
          <p className="sr-only">Public navigation menu</p>
        </SidebarHeader>
        <SidebarContent className="bg-ivory-50 dark:bg-obsidian-950">
          <nav className="grid gap-7 px-4 py-5" aria-label="Mobile public navigation">
            <MobileNavGroup label="Discover" items={discoverItems} />
            <MobileNavGroup label="Consult" items={consultItems} />
            <div className="space-y-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-500 dark:text-gold-400/82">
                More
              </p>
              <MobileUtilityRows />
              <div className="space-y-1">
                {moreItems.map((item) => (
                  <MobileMenuRow item={item} key={item.href} />
                ))}
              </div>
            </div>
          </nav>
        </SidebarContent>
        <SidebarFooter className="border-t border-gold-500/14 bg-ivory-50 p-4 dark:border-gold-400/14 dark:bg-obsidian-950">
          <TalkToAstrologerCta className="w-full" />
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}

export function PublicHeader() {
  const desktopItems = publicNavItems.filter((item) => item.group !== "more")

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        "border-gold-500/18 bg-background text-foreground",
        "dark:dark-surface dark:border-gold-400/15 dark:bg-obsidian-950 dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--espresso-900)_92%,var(--obsidian-950)),var(--obsidian-950))]"
      )}
    >
      <Container className="flex h-16 max-w-[1440px] items-center justify-between gap-4 lg:h-[72px]">
        <Brand />
        <span
          aria-hidden="true"
          className="hidden size-1.5 rounded-full bg-gold-400/80 shadow-[0_0_10px_color-mix(in_srgb,var(--gold-400)_45%,transparent)] lg:block"
        />
        <nav
          className="hidden flex-1 items-center justify-center gap-4 lg:flex xl:gap-6"
          aria-label="Primary public navigation"
        >
          {desktopItems.map((item) => (
            <DesktopNavItem item={item} key={item.href} />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeUtilityButton />
            <LanguageDropdown />
          </div>
          <Button
            aria-label="Sign in"
            className={cn(
              "hidden gap-1.5 bg-transparent px-2 text-[15px] font-medium transition-colors duration-200 hover:bg-transparent md:inline-flex",
              "text-foreground/70 hover:text-foreground focus-visible:ring-offset-background",
              "dark:text-ivory-50/72 dark:hover:text-ivory-50"
            )}
            type="button"
            variant="ghost"
          >
            <UserRound aria-hidden="true" />
            Sign In
          </Button>
          <TalkToAstrologerCta className="hidden lg:inline-flex" />
          <div className="lg:hidden">
            <MobilePublicMenu />
          </div>
        </div>
      </Container>
    </header>
  )
}
