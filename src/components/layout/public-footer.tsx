"use client"

import Link from "next/link"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { BrandMark } from "./public-header"
import { Container } from "./container"

type FooterLink = { label: string; route: string; real?: boolean }

const ASTROLOGY_LINKS: FooterLink[] = [
  { label: "Horoscope", route: "/horoscope" },
  { label: "Kundli", route: "/kundli" },
  { label: "Kundli Matching", route: "/compatibility" },
  { label: "Panchang", route: "/panchang" },
  { label: "Calculators", route: "/calculators", real: true },
  { label: "Astrology Services", route: "/services" },
  { label: "Online Pooja", route: "/pooja", real: true },
]

const CONSULTATION_LINKS: FooterLink[] = [
  { label: "Find Astrologers", route: "/astrologers", real: true },
  { label: "Career Guidance", route: "/services/career-guidance" },
  { label: "Relationship Guidance", route: "/services/relationship-guidance" },
  { label: "Kundli Consultation", route: "/services/kundli-consultation" },
  { label: "Ask an Astrologer", route: "/services/ask-an-astrologer" },
]

// Preview-only fixture — mirrors the 12 sign slugs used on the homepage's
// Daily Horoscope selector. No destination pages exist yet.
const ZODIAC_LINKS: FooterLink[] = [
  { label: "Aries", route: "/horoscope/aries" },
  { label: "Taurus", route: "/horoscope/taurus" },
  { label: "Gemini", route: "/horoscope/gemini" },
  { label: "Cancer", route: "/horoscope/cancer" },
  { label: "Leo", route: "/horoscope/leo" },
  { label: "Virgo", route: "/horoscope/virgo" },
  { label: "Libra", route: "/horoscope/libra" },
  { label: "Scorpio", route: "/horoscope/scorpio" },
  { label: "Sagittarius", route: "/horoscope/sagittarius" },
  { label: "Capricorn", route: "/horoscope/capricorn" },
  { label: "Aquarius", route: "/horoscope/aquarius" },
  { label: "Pisces", route: "/horoscope/pisces" },
]

const LEARN_LINKS: FooterLink[] = [
  { label: "Astrology Guides", route: "/articles" },
  { label: "Birth Chart", route: "/article/understanding-your-birth-chart" },
  { label: "Zodiac Signs", route: "/article/what-your-moon-sign-represents" },
  { label: "Compatibility", route: "/article/beginners-guide-to-kundli-matching" },
  { label: "Panchang Guides", route: "/articles" },
]

// Standard, non-proprietary support pages. Refund/Cancellation is
// intentionally omitted — no such policy is documented anywhere in the
// project docs yet.
const COMPANY_LINKS: FooterLink[] = [
  { label: "About", route: "/about" },
  { label: "Contact", route: "/contact" },
  { label: "Help / FAQ", route: "/help" },
  { label: "Privacy", route: "/privacy" },
  { label: "Terms", route: "/terms" },
]

const FOOTER_LINK_CLASS =
  "group inline-flex items-center gap-1.5 rounded py-0.5 text-left text-sm leading-6 text-foreground/70 outline-none transition-colors duration-200 hover:text-gold-500 focus-visible:text-gold-500 dark:text-ivory-50/70 dark:hover:text-gold-300 dark:focus-visible:text-gold-300"

const FOOTER_LINK_LABEL_CLASS =
  "translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"

function FooterLinkButton({ label, route, real }: FooterLink) {
  if (real) {
    return (
      <Link href={route} className={FOOTER_LINK_CLASS}>
        <span className={FOOTER_LINK_LABEL_CLASS}>{label}</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      data-route={route}
      onClick={() => toast(`${label} opens once this page is built.`)}
      title={`${label} is planned for a later screen`}
      className={FOOTER_LINK_CLASS}
    >
      <span className={FOOTER_LINK_LABEL_CLASS}>{label}</span>
    </button>
  )
}

function FooterColumn({
  id,
  title,
  links,
  columns = 1,
}: {
  id: string
  title: string
  links: FooterLink[]
  columns?: 1 | 2
}) {
  return (
    <nav aria-labelledby={id} className="text-gold-500 dark:text-gold-400/85">
      <h2
        id={id}
        className="font-sans text-xs font-bold uppercase tracking-[0.14em]"
      >
        {title}
      </h2>
      <ul
        className={cn(
          "mt-5 space-y-3",
          columns === 2 && "grid grid-cols-2 gap-x-4 gap-y-2.5 space-y-0",
        )}
      >
        {links.map((link) => (
          <li key={link.label}>
            <FooterLinkButton {...link} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

const MOBILE_GROUPS: Array<{
  value: string
  title: string
  links: FooterLink[]
  columns?: 1 | 2
}> = [
  { value: "astrology", title: "Astrology", links: ASTROLOGY_LINKS },
  { value: "consultation", title: "Consultation", links: CONSULTATION_LINKS },
  { value: "horoscope", title: "Horoscope", links: ZODIAC_LINKS, columns: 2 },
  { value: "learn", title: "Learn", links: LEARN_LINKS },
  { value: "company", title: "Company", links: COMPANY_LINKS },
]

function MobileFooterAccordion() {
  return (
    <Accordion type="multiple" className="w-full">
      {MOBILE_GROUPS.map((group) => (
        <AccordionItem
          key={group.value}
          value={group.value}
          className="border-gold-500/16 dark:border-gold-400/15"
        >
          <AccordionTrigger className="text-sm font-semibold uppercase tracking-[0.1em] text-foreground hover:text-gold-500 dark:text-ivory-50 dark:hover:text-gold-300">
            {group.title}
          </AccordionTrigger>
          <AccordionContent>
            <ul
              className={cn(
                "space-y-2.5",
                group.columns === 2 && "grid grid-cols-2 gap-x-4 gap-y-2 space-y-0",
              )}
            >
              {group.links.map((link) => (
                <li key={link.label}>
                  <FooterLinkButton {...link} />
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function FooterBrand({ className }: { className?: string }) {
  return (
    <div className={cn("max-w-xs", className)}>
      <Link
        href="/"
        aria-label="Astrology home"
        className="group inline-flex items-center gap-3 text-foreground outline-none transition-colors duration-300 hover:text-gold-500 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:text-ivory-50 dark:hover:text-gold-300 dark:focus-visible:ring-offset-obsidian-950"
      >
        <BrandMark />
        <span className="font-display text-xl font-semibold leading-none">
          Astrology
        </span>
      </Link>
      <p className="mt-4 text-sm leading-6 text-foreground/70 dark:text-ivory-50/70">
        Modern astrology guidance, tools and consultation in one clear
        experience.
      </p>
    </div>
  )
}

function FooterLegal() {
  return (
    <div className="border-t border-gold-500/16 py-6 text-xs text-foreground/55 dark:border-gold-400/15 dark:text-ivory-50/55">
      <p>© 2026 Astrology. All rights reserved.</p>
    </div>
  )
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-gold-500/18 bg-surface-muted text-foreground dark:border-gold-400/18 dark:bg-obsidian-footer dark:text-ivory-50">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full border border-gold-500/10 dark:border-gold-400/8"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full border border-gold-500/8 dark:border-gold-400/6"
      />
      <Container className="relative max-w-[1440px]">
        <div className="py-10 sm:py-12">
          {/* Mobile / tablet: brand first, then compact accordion groups */}
          <div className="lg:hidden">
            <FooterBrand />
            <div className="mt-8">
              <MobileFooterAccordion />
            </div>
          </div>

          {/* Desktop: brand column beside five link columns */}
          <div className="hidden lg:grid lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_1fr] lg:gap-10">
            <FooterBrand />
            <FooterColumn id="footer-astrology" title="Astrology" links={ASTROLOGY_LINKS} />
            <FooterColumn id="footer-consultation" title="Consultation" links={CONSULTATION_LINKS} />
            <FooterColumn id="footer-horoscope" title="Horoscope" links={ZODIAC_LINKS} columns={2} />
            <FooterColumn id="footer-learn" title="Learn" links={LEARN_LINKS} />
            <FooterColumn id="footer-company" title="Company" links={COMPANY_LINKS} />
          </div>
        </div>

        <FooterLegal />
      </Container>
    </footer>
  )
}
