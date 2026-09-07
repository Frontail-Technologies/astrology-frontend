import type { PoojaRitualStep } from "../types/pooja";

type PoojaRitualOverviewProps = {
  poojaName: string;
  steps: PoojaRitualStep[];
};

export function PoojaRitualOverview({
  poojaName,
  steps,
}: PoojaRitualOverviewProps) {
  return (
    <section aria-labelledby="pooja-ritual-overview-heading">
      <h2
        id="pooja-ritual-overview-heading"
        className="font-display text-[28px] font-semibold text-foreground sm:text-[32px]"
      >
        What the Pooja May Include
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">
        {poojaName} typically follows the sequence below. The exact structure,
        offerings and recitation are decided by the officiating priest and may
        vary depending on the ritual format.
      </p>

      <ol className="mt-8 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative">
            {/* Connector line to the next step — subtle, secondary to the circles */}
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-11 top-[22px] hidden h-px -right-4 bg-gradient-to-r from-gold-500/35 to-gold-500/5 dark:from-gold-400/30 dark:to-gold-400/5 lg:left-12 lg:top-6 lg:block"
              />
            ) : null}
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-full bg-conversion-500 font-display text-base font-semibold text-midnight-950 shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--conversion-600)_55%,transparent)] ring-1 ring-inset ring-conversion-600/25 lg:size-12 lg:text-[17px]"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-4 font-sans text-[15px] font-bold text-foreground">
              {step.title}
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
