import { ArrowRight } from "lucide-react";

type CalculatorHowItWorksProps = {
  steps: string[];
};

export function CalculatorHowItWorks({ steps }: CalculatorHowItWorksProps) {
  return (
    <section
      aria-labelledby="calculator-how-it-works-heading"
      className="rounded-3xl bg-gold-300/9 p-6 dark:bg-espresso-800/45 sm:p-8"
    >
      <h2
        id="calculator-how-it-works-heading"
        className="font-display text-[26px] font-semibold text-foreground sm:text-[30px]"
      >
        How This Calculator Works
      </h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-7 text-muted-foreground">
        A simple and transparent process. The astrology calculation engine is not
        connected yet, so no result is generated at this step.
      </p>

      <ol className="mt-7 grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step} className="relative">
            {index < steps.length - 1 ? (
              <ArrowRight
                aria-hidden="true"
                className="pointer-events-none absolute right-[-0.75rem] top-3 hidden size-4 text-gold-500/50 dark:text-gold-400/40 lg:block"
              />
            ) : null}
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-full bg-conversion-500 font-display text-base font-semibold text-midnight-950 shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--conversion-600)_55%,transparent)] ring-1 ring-inset ring-conversion-600/25 lg:size-12 lg:text-[17px]"
            >
              {index + 1}
            </span>
            <p className="mt-4 text-[13.5px] leading-[1.55] text-foreground/80">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
