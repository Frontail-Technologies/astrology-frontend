import {
  CheckCircle2,
  ClipboardList,
  Flame,
  Hand,
  MailCheck,
} from "lucide-react";

type ProcessStep = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
};

// No payment / livestream / prasad-logistics steps — those flows are not
// approved yet (spec 24).
const STEPS: ProcessStep[] = [
  {
    icon: Hand,
    title: "Choose a Pooja",
    text: "Pick a ritual that fits the occasion you have in mind.",
  },
  {
    icon: ClipboardList,
    title: "Share Ritual Details",
    text: "Provide names, gotra and any preferences for the ritual.",
  },
  {
    icon: CheckCircle2,
    title: "Confirm Request",
    text: "Review the ritual details and confirm your request.",
  },
  {
    icon: Flame,
    title: "Pooja Is Performed",
    text: "Priests perform the pooja following traditional steps.",
  },
  {
    icon: MailCheck,
    title: "Receive Completion Details",
    text: "Get a summary once the ritual has been completed.",
  },
];

export function PoojaProcess() {
  return (
    <section aria-labelledby="pooja-process-heading">
      <h2
        id="pooja-process-heading"
        className="text-2xl font-semibold text-foreground sm:text-[26px]"
      >
        How Online Pooja Works
      </h2>

      <ol className="mt-6 grid gap-9 rounded-2xl border border-gold-500/18 bg-white p-6 shadow-[0_1px_2px_rgba(23,32,51,0.04),0_4px_16px_-6px_rgba(23,32,51,0.08)] dark:border-gold-400/18 dark:bg-espresso-900 dark:shadow-none sm:gap-7 sm:p-7 lg:grid-cols-5 lg:gap-5 lg:p-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={step.title}
              className="relative flex gap-4 lg:flex-col lg:gap-4"
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-6 top-14 bottom-[-2.25rem] w-0.5 rounded-full bg-conversion-500/35 dark:bg-conversion-500/40 lg:left-12 lg:right-[-1.25rem] lg:top-6 lg:bottom-auto lg:h-0.5 lg:w-auto"
                />
              ) : null}

              <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-conversion-500 text-midnight-950">
                <Icon className="size-5" aria-hidden="true" />
              </span>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-conversion-600 dark:text-conversion-500">
                  Step {index + 1}
                </p>
                <p className="mt-1 font-sans text-[15px] font-bold text-foreground">
                  {step.title}
                </p>
                <p className="mt-1 text-[12.5px] leading-[1.5] text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
