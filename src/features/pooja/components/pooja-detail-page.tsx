import { Container } from "@/components/layout/container";
import { DiyaFlameAccent } from "@/components/shared/diya-flame-accent";
import { SectionChakra } from "@/components/shared/section-chakra";
import { getRelatedPoojas } from "../data/poojas";
import type { PoojaDefinition } from "../types/pooja";
import { PoojaDetailCta } from "./pooja-detail-cta";
import { PoojaDetailHero } from "./pooja-detail-hero";
import { PoojaDetailsPrep } from "./pooja-preparation";
import { PoojaProcess } from "./pooja-process";
import { PoojaQuickFacts } from "./pooja-quick-facts";
import { PoojaRequestSummary } from "./pooja-request-summary";
import { PoojaRitualOverview } from "./pooja-ritual-overview";
import { RelatedPoojas } from "./related-poojas";

type PoojaDetailPageProps = {
  pooja: PoojaDefinition;
};

export function PoojaDetailPage({ pooja }: PoojaDetailPageProps) {
  const { detail } = pooja;
  const relatedPoojas = getRelatedPoojas(pooja);
  const [lead, ...restOverview] = detail.overview;

  return (
    <main className="relative text-foreground">
      <PoojaDetailHero pooja={pooja} />

      {/* Quick facts — floating strip overlapping the hero bottom */}
      <Container className="max-w-[1320px]">
        <div className="-mt-12 lg:-mt-16">
          <PoojaQuickFacts facts={detail.quickFacts} />
        </div>
      </Container>

      {/* Main service-detail grid */}
      <Container className="max-w-[1320px] pt-14 sm:pt-16 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div className="order-2 min-w-0 space-y-16 lg:order-1 lg:space-y-20">
            {/* About */}
            <section aria-labelledby="pooja-about-heading">
              <span
                aria-hidden="true"
                className="block h-px w-12 bg-gold-500/50 dark:bg-gold-400/45"
              />
              <h2
                id="pooja-about-heading"
                className="mt-4 font-display text-[28px] font-semibold text-foreground sm:text-[32px]"
              >
                About {pooja.name}
              </h2>
              <p className="mt-3 max-w-2xl text-[16px] leading-8 text-foreground/85">
                {lead}
              </p>

              {restOverview.length > 0 ? (
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
                  <div className="space-y-3 text-[15px] leading-7 text-muted-foreground">
                    {restOverview.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <aside className="h-fit rounded-2xl border border-gold-500/18 bg-ivory-50 p-5 dark:border-gold-400/16 dark:bg-espresso-900">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
                      Devotional context
                    </p>
                    <dl className="mt-3 space-y-3">
                      {detail.quickFacts.slice(0, 2).map((fact) => (
                        <div key={fact.label}>
                          <dt className="text-[12px] font-semibold text-muted-foreground">
                            {fact.label}
                          </dt>
                          <dd className="mt-0.5 text-[13.5px] leading-6 text-foreground/85">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </aside>
                </div>
              ) : null}
            </section>

            {/* Optional per-Pooja domain panel */}
            {detail.optionalSection ? (
              <section
                aria-labelledby="pooja-optional-heading"
                className="rounded-2xl border border-gold-500/18 bg-gold-300/10 p-6 dark:border-gold-400/16 dark:bg-gold-400/6 sm:p-8"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-500 dark:text-gold-300">
                  Context
                </p>
                <h2
                  id="pooja-optional-heading"
                  className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-[28px]"
                >
                  {detail.optionalSection.title}
                </h2>
                <div className="mt-3 space-y-3 text-[15px] leading-7 text-foreground/80">
                  {detail.optionalSection.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            <PoojaRitualOverview
              poojaName={pooja.name}
              steps={detail.ritualSteps}
            />

            <PoojaDetailsPrep
              requiredDetails={detail.requiredDetails}
              preparationNotes={detail.preparationNotes}
            />

            {/* Process — warmer tinted band with one selective chakra + flame */}
            <div className="relative overflow-hidden rounded-3xl bg-gold-300/9 p-5 dark:bg-espresso-800/45 sm:p-7 lg:p-8">
              <SectionChakra spin className="-right-40 -top-40 w-[28rem]" />
              <DiyaFlameAccent className="right-3 bottom-2 sm:right-5 sm:bottom-3" />
              <div className="relative">
                <PoojaProcess />
              </div>
            </div>
          </div>

          {/* Sticky request panel (in-flow on mobile, right rail on desktop) */}
          <aside className="order-1 lg:order-2">
            <PoojaRequestSummary pooja={pooja} />
          </aside>
        </div>
      </Container>

      {/* Related Poojas */}
      <Container className="max-w-[1320px] py-16 lg:py-20">
        <RelatedPoojas poojas={relatedPoojas} />
      </Container>

      {/* Contextual consultation CTA — full-bleed deep warm band */}
      <PoojaDetailCta />
    </main>
  );
}
