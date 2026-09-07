import type { PoojaQuickFact } from "../types/pooja";

type PoojaQuickFactsProps = {
  facts: PoojaQuickFact[];
};

export function PoojaQuickFacts({ facts }: PoojaQuickFactsProps) {
  return (
    <section aria-labelledby="pooja-quick-facts-heading" className="relative z-20">
      <h2 id="pooja-quick-facts-heading" className="sr-only">
        Ritual at a glance
      </h2>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gold-500/18 bg-gold-500/12 shadow-[0_10px_34px_-12px_rgba(23,32,51,0.28)] dark:border-gold-400/18 dark:bg-gold-400/12 dark:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] sm:grid-cols-4">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="min-w-0 bg-white p-4 dark:bg-espresso-900 sm:p-5"
          >
            <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gold-500 dark:text-gold-300">
              {fact.label}
            </dt>
            <dd className="mt-1.5 text-[13px] font-medium leading-5 text-foreground/85">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
