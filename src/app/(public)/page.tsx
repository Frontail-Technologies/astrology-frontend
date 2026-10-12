import { existsSync } from "node:fs";
import { join } from "node:path";

import { AstrologerGuidanceCta } from "@/features/homepage/components/astrologer-guidance-cta";
import { AstrologersSection } from "@/features/homepage/components/astrologers-section";
import { AstrologyGuidesSection } from "@/features/homepage/components/astrology-guides-section";
import { AstrologyServicesSection } from "@/features/homepage/components/astrology-services-section";
import { CalculatorsSection } from "@/features/homepage/components/calculators-section";
import { DailyHoroscopeSection } from "@/features/homepage/components/daily-horoscope-section";
import { ExploreAstrologySection } from "@/features/homepage/components/explore-astrology-section";
import { GuidanceConcernGrid } from "@/features/homepage/components/guidance-concern-grid";
import { HomepageHero } from "@/features/homepage/components/homepage-hero";
import { HomepageFaq } from "@/features/homepage/components/homepage-faq";
import { HomepageReviews } from "@/features/homepage/components/homepage-reviews";
import { KundliCompatibilitySection } from "@/features/homepage/components/kundli-compatibility-section";
import { OnlinePoojaSection } from "@/features/homepage/components/online-pooja-section";
import { PanchangSection } from "@/features/homepage/components/panchang-section";

// The Moon is Earth's satellite and needs its own moon.png. If the asset is not
// present it is simply omitted — no other body is substituted for it.
const MOON_AVAILABLE = existsSync(
  join(process.cwd(), "public/assets/astrology/solar-system/moon.png"),
);

export default function HomePage() {
  return (
    <main>
      <HomepageHero moonAvailable={MOON_AVAILABLE} />
      <ExploreAstrologySection />
      <GuidanceConcernGrid />
      <DailyHoroscopeSection />
      {/* <KundliCompatibilitySection /> */}
      <AstrologersSection />
      <HomepageReviews />
      <OnlinePoojaSection />
      <AstrologyServicesSection />
      <CalculatorsSection />
      {/* <PanchangSection /> */}
      <AstrologyGuidesSection />
      <HomepageFaq />
      <AstrologerGuidanceCta />
    </main>
  );
}
