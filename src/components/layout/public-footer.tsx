"use client"

import Link from "next/link"
import { BadgeCheck, BookOpenCheck, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { BrandMark } from "./public-header"
import { Container } from "./container"

type FooterLink = { label: string; route: string }

const FOOTER_GROUPS: Array<{
  id: string
  title: string
  links: FooterLink[]
}> = [
  {
    id: "footer-astrology",
    title: "Astrology",
    links: [
      { label: "Horoscopes", route: "/horoscope" },
      { label: "Calculators", route: "/calculators" },
    ],
  },
  {
    id: "footer-consultation",
    title: "Consultation",
    links: [
      { label: "Find Astrologers", route: "/astrologers" },
      { label: "Online Pooja", route: "/pooja" },
    ],
  },
  {
    id: "footer-learn",
    title: "Learn",
    links: [{ label: "Articles & Guides", route: "/articles" }],
  },
  {
    id: "footer-company",
    title: "Company",
    links: [{ label: "Store", route: "/shop" }],
  },
]

const TRUST_ITEMS = [
  { label: "Expert guidance", icon: BadgeCheck },
  { label: "Clear information", icon: BookOpenCheck },
  { label: "Practical tools", icon: Sparkles },
]

const FOOTER_LINK_CLASS =
  "group inline-flex rounded py-0.5 text-left text-sm leading-5 text-foreground/78 outline-none transition-colors duration-200 hover:text-conversion-500 focus-visible:text-conversion-500 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50 dark:text-ivory-50/72 dark:hover:text-gold-300 dark:focus-visible:text-gold-300 dark:focus-visible:ring-offset-obsidian-footer"

function FooterLinkButton({ label, route }: FooterLink) {
  return (
    <Link href={route} className={FOOTER_LINK_CLASS}>
      <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
        {label}
      </span>
    </Link>
  )
}

function FooterColumn({
  id,
  title,
  links,
  className,
}: {
  id: string
  title: string
  links: FooterLink[]
  className?: string
}) {
  return (
    <nav aria-labelledby={id} className={className}>
      <h2
        id={id}
        className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-saffron-600 dark:text-gold-400"
      >
        {title}
      </h2>
      <ul className="mt-3 space-y-1.5">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLinkButton {...link} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

function FooterBrand({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-sm", className)}>
      <Link
        href="/"
        aria-label="Astrology home"
        className="group inline-flex items-center gap-3 rounded text-foreground outline-none transition-colors duration-200 hover:text-conversion-500 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory-50 dark:text-ivory-50 dark:hover:text-gold-300 dark:focus-visible:ring-offset-obsidian-footer"
      >
        <BrandMark />
        <span className="font-display text-xl font-semibold leading-none">
          Astrology
        </span>
      </Link>
      <p className="mt-3 max-w-[18rem] text-sm leading-5 text-foreground/68 dark:text-ivory-50/65">
        Modern astrology guidance, practical tools, and consultation in one clear experience.
      </p>
    </div>
  )
}

function TrustStrip() {
  return (
    <div className="border-t border-gold-500/14 py-3.5 dark:border-gold-400/12">
      <ul className="grid grid-cols-1 gap-2.5 text-xs font-medium text-foreground/68 min-[430px]:grid-cols-3 min-[430px]:gap-4 dark:text-ivory-50/65">
        {TRUST_ITEMS.map(({ label, icon: Icon }) => (
          <li className="flex items-center gap-2" key={label}>
            <Icon aria-hidden="true" className="size-4 shrink-0 text-saffron-600 dark:text-gold-400" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterLegal() {
  return (
    <div className="flex min-h-12 items-center border-t border-gold-500/14 py-3 text-xs text-foreground/55 dark:border-gold-400/12 dark:text-ivory-50/50">
      <p>&copy; 2026 Astrology. All rights reserved.</p>
    </div>
  )
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-gold-500/20 bg-ivory-50 text-foreground dark:border-gold-400/18 dark:bg-obsidian-footer dark:text-ivory-50">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full border border-gold-500/8 dark:border-gold-400/8"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-gold-500/7 dark:border-gold-400/6"
      />

      <Container className="relative max-w-[1440px]">
        <div className="py-8 sm:py-9 lg:py-10">
          <div className="lg:hidden">
            <FooterBrand />
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6 sm:max-w-2xl sm:gap-x-10">
              {FOOTER_GROUPS.map((group) => (
                <FooterColumn key={group.id} {...group} />
              ))}
            </div>
          </div>

          <div className="hidden lg:grid lg:grid-cols-[1.45fr_repeat(4,minmax(0,1fr))] lg:gap-x-8 xl:gap-x-12">
            <FooterBrand />
            {FOOTER_GROUPS.map((group) => (
              <FooterColumn key={group.id} {...group} />
            ))}
          </div>
        </div>

        <TrustStrip />
        <FooterLegal />
      </Container>
    </footer>
  )
}
