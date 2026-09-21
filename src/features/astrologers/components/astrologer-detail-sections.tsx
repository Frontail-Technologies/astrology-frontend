import { CalendarClock, Check, Compass, Languages, MessagesSquare } from "lucide-react";

import { availabilityLabel, consultationSteps } from "../data/astrologers";
import type { AstrologerListItem } from "../types/astrologer";

const H2 =
  "font-display text-[28px] font-semibold text-foreground sm:text-[32px]";
const PANEL =
  "rounded-2xl border border-gold-500/22 bg-white p-5 shadow-[0_1px_2px_rgba(23,32,51,0.05),0_8px_22px_rgba(75,52,24,0.05)] dark:border-gold-400/16 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] sm:p-6";
const TAG =
  "inline-flex items-center rounded-full border border-gold-500/28 bg-ivory-50 px-3 py-1 text-[13px] font-medium text-foreground/85 dark:border-gold-400/24 dark:bg-espresso-800";

type Props = { astrologer: AstrologerListItem };

export function AstrologerAboutSection({ astrologer }: Props) {
  const detail = astrologer.detail;
  if (!detail) return null;
  const [lead, ...rest] = detail.bio;

  return (
    <section id="overview" aria-labelledby="astrologer-about-heading" className="scroll-mt-36">
      <span aria-hidden="true" className="block h-px w-12 bg-gold-500/50 dark:bg-gold-400/45" />
      <h2 id="astrologer-about-heading" className={`mt-4 ${H2}`}>
        About {astrologer.name}
      </h2>
      <p className="mt-3 max-w-2xl text-[16px] leading-8 text-foreground/85">{lead}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        <div className="space-y-3 text-[15px] leading-7 text-muted-foreground">
          {rest.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside className="h-fit rounded-2xl border border-gold-500/18 bg-ivory-50 p-5 dark:border-gold-400/16 dark:bg-espresso-900">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
            Focus areas
          </p>
          <ul className="mt-3 space-y-2.5">
            {[astrologer.primaryExpertise, ...astrologer.specialties].map((item) => (
              <li key={item} className="flex gap-2.5 text-[13.5px] leading-6 text-foreground/85">
                <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-gold-500 dark:text-gold-300" />
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

export function AstrologerExpertiseSection({ astrologer }: Props) {
  const detail = astrologer.detail;
  if (!detail) return null;

  return (
    <section id="expertise" aria-labelledby="astrologer-expertise-heading" className="scroll-mt-36">
      <h2 id="astrologer-expertise-heading" className={H2}>
        Areas of Guidance
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">
        Themes {astrologer.name.split(" ")[0]} traditionally works with in a consultation.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {detail.guidanceAreas.map((area) => (
          <li key={area.title} className={PANEL}>
            <span className="grid size-10 place-items-center rounded-full border border-gold-500/25 bg-gold-300/20 text-gold-500 dark:border-gold-400/22 dark:bg-gold-400/10 dark:text-gold-300">
              <Compass aria-hidden="true" className="size-[18px]" />
            </span>
            <h3 className="mt-3 font-sans text-[15px] font-bold text-foreground">{area.title}</h3>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-muted-foreground">{area.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AstrologerApproachSection({ astrologer }: Props) {
  const detail = astrologer.detail;
  if (!detail) return null;

  return (
    <section id="approach" aria-labelledby="astrologer-approach-heading" className="scroll-mt-36">
      <h2 id="astrologer-approach-heading" className={H2}>
        How Consultations Work
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">
        {detail.approachFocus}
      </p>
      <ol className="mt-8 grid gap-x-5 gap-y-8 sm:grid-cols-3">
        {consultationSteps.map((step, index) => (
          <li key={step.title} className="relative">
            {index < consultationSteps.length - 1 ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-12 top-6 -right-4 hidden h-px bg-gradient-to-r from-gold-500/35 to-gold-500/5 dark:from-gold-400/30 dark:to-gold-400/5 sm:block"
              />
            ) : null}
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-full bg-conversion-500 font-display text-base font-semibold text-midnight-950 shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--conversion-600)_55%,transparent)] ring-1 ring-inset ring-conversion-600/25 lg:size-12 lg:text-[17px]"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-4 font-sans text-[15px] font-bold text-foreground">{step.title}</p>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-xl border border-gold-500/18 bg-gold-300/10 p-4 text-[13px] leading-6 text-foreground/80 dark:border-gold-400/16 dark:bg-gold-400/6">
        Astrology is offered as traditional guidance for personal reflection. It is not a
        substitute for medical, legal or financial advice, and it does not predict or
        guarantee any outcome.
      </p>
    </section>
  );
}

export function AstrologerLanguagesSection({ astrologer }: Props) {
  const detail = astrologer.detail;
  if (!detail) return null;

  return (
    <section id="languages" aria-labelledby="astrologer-languages-heading" className="scroll-mt-36">
      <h2 id="astrologer-languages-heading" className={H2}>
        Languages &amp; Formats
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={PANEL}>
          <div className="flex items-center gap-2.5">
            <Languages aria-hidden="true" className="size-[18px] text-gold-500 dark:text-gold-300" />
            <h3 className="font-display text-xl font-semibold text-foreground">Languages</h3>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {astrologer.languages.map((language) => (
              <li key={language} className={TAG}>{language}</li>
            ))}
          </ul>
        </div>
        <div className={PANEL}>
          <div className="flex items-center gap-2.5">
            <MessagesSquare aria-hidden="true" className="size-[18px] text-gold-500 dark:text-gold-300" />
            <h3 className="font-display text-xl font-semibold text-foreground">Consultation Formats</h3>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {detail.consultationModes.map((mode) => (
              <li key={mode} className={TAG}>{mode}</li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] leading-5 text-muted-foreground">
            Planned profile formats. Consultations cannot be booked yet.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AstrologerAvailabilitySection({ astrologer }: Props) {
  return (
    <section id="availability" aria-labelledby="astrologer-availability-heading" className="scroll-mt-36">
      <h2 id="astrologer-availability-heading" className={H2}>
        Availability
      </h2>
      <div className={`mt-6 flex items-start gap-4 ${PANEL}`}>
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold-500/25 bg-gold-300/20 text-gold-500 dark:border-gold-400/22 dark:bg-gold-400/10 dark:text-gold-300">
          <CalendarClock aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="font-sans text-[15px] font-bold text-foreground">
            {availabilityLabel(astrologer.availability)}
          </p>
          <p className="mt-1 text-[13.5px] leading-6 text-muted-foreground">
            Consultation scheduling will be available soon. Live time slots are not shown
            until booking is connected.
          </p>
        </div>
      </div>
    </section>
  );
}
