"use client"

import type { LucideIcon } from "lucide-react"
import { ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export type PublicNavChild = {
  label: string
  href: string
}

export type PublicNavItem = {
  label: string
  href: string
  status: "implemented" | "planned"
  group: "discover" | "consult" | "more"
  icon: LucideIcon
  children?: PublicNavChild[]
}

function itemIsActive(pathname: string, item: PublicNavItem) {
  return item.status === "implemented" &&
    (pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      item.children?.some(
        (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
      ))
}

function HeaderDropdownPanel({
  id,
  item,
  onNavigate,
}: {
  id: string
  item: PublicNavItem
  onNavigate: () => void
}) {
  return (
    <div
      id={id}
      className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2"
      role="menu"
    >
      <div className="rounded-xl border border-gold-500/18 bg-[#fffdf8] p-2 shadow-[0_18px_50px_rgba(38,28,19,0.16)] dark:border-gold-400/18 dark:bg-espresso-900 dark:shadow-[0_20px_55px_rgba(0,0,0,0.45)]">
        {item.children?.map((child) => (
          <Link
            className="group flex min-h-11 items-center justify-between gap-4 rounded-lg px-3.5 py-2.5 text-sm font-medium text-foreground/78 outline-none transition-colors hover:bg-gold-300/18 hover:text-foreground focus-visible:bg-gold-300/18 focus-visible:ring-2 focus-visible:ring-gold-400 dark:text-ivory-50/78 dark:hover:bg-espresso-700 dark:hover:text-ivory-50 dark:focus-visible:bg-espresso-700"
            href={child.href}
            key={`${item.href}-${child.href}`}
            onClick={onNavigate}
            role="menuitem"
          >
            <span>{child.label}</span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-gold-500/65 transition-transform group-hover:translate-x-0.5 dark:text-gold-300/65"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

function DesktopHeaderNavItem({
  item,
  pathname,
}: {
  item: PublicNavItem
  pathname: string
}) {
  const active = itemIsActive(pathname, item)
  const hasChildren = item.status === "implemented" && Boolean(item.children?.length)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownId = useId()

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  useEffect(() => () => cancelClose(), [])

  const triggerClassName = cn(
    "group relative inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-md px-1 text-[15px] font-medium outline-none transition-colors duration-200 ease-out",
    "text-foreground/65 hover:text-foreground dark:text-ivory-50/70 dark:hover:text-ivory-50",
    "focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "after:absolute after:inset-x-1 after:bottom-1 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-conversion-500 after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100",
    (active || open) && "font-semibold text-conversion-500 after:scale-x-100 dark:text-gold-300",
    item.status === "planned" && "cursor-default",
  )

  if (hasChildren) {
    return (
      <div
        className="relative"
        onMouseEnter={() => {
          cancelClose()
          setOpen(true)
        }}
        onMouseLeave={scheduleClose}
        ref={rootRef}
      >
        <button
          aria-controls={dropdownId}
          aria-expanded={open}
          aria-haspopup="menu"
          className={triggerClassName}
          onClick={() => setOpen((value) => !value)}
          ref={triggerRef}
          type="button"
        >
          <span>{item.label}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
          />
        </button>
        {open ? (
          <HeaderDropdownPanel id={dropdownId} item={item} onNavigate={() => setOpen(false)} />
        ) : null}
      </div>
    )
  }

  if (item.status === "implemented") {
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={triggerClassName}
        href={item.href}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <button
      aria-disabled="true"
      className={triggerClassName}
      title={`${item.label} route is planned for a later screen`}
      type="button"
    >
      {item.label}
    </button>
  )
}

function MobileHeaderNavItem({
  item,
  onNavigate,
}: {
  item: PublicNavItem
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(false)
  const childId = useId()
  const Icon = item.icon
  const hasChildren = item.status === "implemented" && Boolean(item.children?.length)
  const rowClassName = cn(
    "group flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-foreground/80 outline-none transition-colors dark:text-ivory-50/82",
    "hover:bg-gold-300/15 hover:text-foreground focus-visible:bg-gold-300/15 focus-visible:ring-2 focus-visible:ring-gold-400 dark:hover:bg-espresso-800 dark:hover:text-ivory-50",
    item.status === "planned" && "cursor-default",
  )
  const content = (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-gold-300/20 text-gold-500 dark:bg-espresso-900/70 dark:text-gold-300">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="flex-1">{item.label}</span>
    </>
  )

  if (hasChildren) {
    return (
      <div>
        <button
          aria-controls={childId}
          aria-expanded={open}
          className={rowClassName}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {content}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
          />
        </button>
        {open ? (
          <div className="ml-7 border-l border-gold-500/20 py-1 pl-4 dark:border-gold-400/18" id={childId}>
            {item.children?.map((child) => (
              <Link
                className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 text-sm font-medium text-foreground/70 outline-none hover:bg-gold-300/15 hover:text-foreground focus-visible:bg-gold-300/15 focus-visible:ring-2 focus-visible:ring-gold-400 dark:text-ivory-50/70 dark:hover:bg-espresso-800 dark:hover:text-ivory-50"
                href={child.href}
                key={`${item.href}-${child.href}`}
                onClick={onNavigate}
              >
                {child.label}
                <ChevronRight aria-hidden="true" className="size-3.5 text-gold-500/65" />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (item.status === "implemented") {
    return (
      <Link className={rowClassName} href={item.href} onClick={onNavigate}>
        {content}
      </Link>
    )
  }

  return (
    <button
      aria-disabled="true"
      className={rowClassName}
      title={`${item.label} route is planned for a later screen`}
      type="button"
    >
      {content}
    </button>
  )
}

export function PublicHeaderNavItem({
  item,
  pathname = "",
  variant,
  onNavigate,
}: {
  item: PublicNavItem
  pathname?: string
  variant: "desktop" | "mobile"
  onNavigate?: () => void
}) {
  return variant === "desktop" ? (
    <DesktopHeaderNavItem item={item} pathname={pathname} />
  ) : (
    <MobileHeaderNavItem item={item} onNavigate={onNavigate} />
  )
}
