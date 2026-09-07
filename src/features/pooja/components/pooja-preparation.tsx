import { CalendarCheck, Check, ClipboardList, Sparkles } from "lucide-react";

type PoojaDetailsPrepProps = {
  requiredDetails: string[];
  preparationNotes: string[];
};

export function PoojaDetailsPrep({
  requiredDetails,
  preparationNotes,
}: PoojaDetailsPrepProps) {
  return (
    <section aria-labelledby="pooja-details-prep-heading" className="grid gap-5 lg:grid-cols-2">
      <h2 id="pooja-details-prep-heading" className="sr-only">
        Details to provide and how to prepare
      </h2>

      <div className="rounded-2xl border border-gold-500/16 bg-ivory-50 p-6 dark:border-gold-400/16 dark:bg-espresso-900 sm:p-7">
        <div className="flex items-center gap-2.5">
          <ClipboardList
            aria-hidden="true"
            className="size-[18px] text-gold-500 dark:text-gold-300"
          />
          <h3 className="font-display text-xl font-semibold text-foreground sm:text-[22px]">
            Details You May Need
          </h3>
        </div>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          The request form is not connected yet. When it is, you can expect to
          share information along these lines.
        </p>
        <ul className="mt-4 space-y-2.5">
          {requiredDetails.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 text-[13.5px] leading-6 text-foreground/85"
            >
              <Check
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-gold-500 dark:text-gold-300"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-gold-500/16 bg-ivory-50 p-6 dark:border-gold-400/16 dark:bg-espresso-900 sm:p-7">
        <div className="flex items-center gap-2.5">
          <CalendarCheck
            aria-hidden="true"
            className="size-[18px] text-gold-500 dark:text-gold-300"
          />
          <h3 className="font-display text-xl font-semibold text-foreground sm:text-[22px]">
            Before the Pooja
          </h3>
        </div>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          A few simple things to keep in mind. Any specific preparation guidance
          is shared before the request is confirmed.
        </p>
        <ul className="mt-4 space-y-2.5">
          {preparationNotes.map((note) => (
            <li
              key={note}
              className="flex gap-2.5 text-[13.5px] leading-6 text-foreground/85"
            >
              <Sparkles
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-gold-500 dark:text-gold-300"
              />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
