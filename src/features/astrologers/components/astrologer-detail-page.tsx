import { Container } from "@/components/layout/container";
import { SectionNav } from "@/components/shared/section-nav";
import { getRelatedAstrologers } from "../data/astrologers";
import type { AstrologerListItem } from "../types/astrologer";
import { AstrologerActionCard } from "./astrologer-action-card";
import { AstrologerDetailCta } from "./astrologer-detail-cta";
import {
  AstrologerAboutSection,
  AstrologerApproachSection,
  AstrologerAvailabilitySection,
  AstrologerExpertiseSection,
  AstrologerLanguagesSection,
} from "./astrologer-detail-sections";
import { AstrologerProfileHero } from "./astrologer-profile-hero";
import { AstrologerQuickFacts } from "./astrologer-quick-facts";
import { RelatedAstrologers } from "./related-astrologers";

const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "expertise", label: "Expertise" },
  { id: "approach", label: "Approach" },
  { id: "languages", label: "Languages" },
  { id: "availability", label: "Availability" },
];

export function AstrologerDetailPage({
  astrologer,
}: {
  astrologer: AstrologerListItem;
}) {
  const related = getRelatedAstrologers(astrologer);

  return (
    <main className="relative text-foreground">
      <AstrologerProfileHero astrologer={astrologer} />

      <Container className="max-w-[1320px] pb-8 sm:pb-10">
        <div className="-mt-12 lg:-mt-16">
          <AstrologerQuickFacts astrologer={astrologer} />
        </div>
      </Container>

      {/* Direct child of <main> so the sticky nav can stick for the whole page. */}
      <SectionNav items={NAV_ITEMS} ariaLabel="Astrologer profile sections" />

      <Container className="max-w-[1320px] pt-12 sm:pt-14 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div className="min-w-0 space-y-16 lg:space-y-20">
            <AstrologerAboutSection astrologer={astrologer} />
            <AstrologerExpertiseSection astrologer={astrologer} />
            <AstrologerApproachSection astrologer={astrologer} />
            <AstrologerLanguagesSection astrologer={astrologer} />
            <AstrologerAvailabilitySection astrologer={astrologer} />
          </div>
          <aside className="hidden lg:block">
            <AstrologerActionCard astrologer={astrologer} />
          </aside>
        </div>
      </Container>

      <Container className="max-w-[1320px] py-16 lg:py-20">
        <RelatedAstrologers astrologers={related} />
      </Container>

      <AstrologerDetailCta />
    </main>
  );
}
