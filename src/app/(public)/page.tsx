import { AstrologerGuidanceCta } from "@/features/homepage/components/astrologer-guidance-cta";
import { AstrologersSection } from "@/features/homepage/components/astrologers-section";
import { AstrologyGuidesSection } from "@/features/homepage/components/astrology-guides-section";
import { AstrologyServicesSection } from "@/features/homepage/components/astrology-services-section";
import { CalculatorsSection } from "@/features/homepage/components/calculators-section";
import { DailyHoroscopeSection } from "@/features/homepage/components/daily-horoscope-section";
import { ExploreAstrologySection } from "@/features/homepage/components/explore-astrology-section";
import { HomepageHero } from "@/features/homepage/components/homepage-hero";
import { KundliCompatibilitySection } from "@/features/homepage/components/kundli-compatibility-section";
import { OnlinePoojaSection } from "@/features/homepage/components/online-pooja-section";
import { PanchangSection } from "@/features/homepage/components/panchang-section";

export default function HomePage() {
  return (
    <main>
      <HomepageHero />
      <ExploreAstrologySection />
      <DailyHoroscopeSection />
      {/* <KundliCompatibilitySection /> */}
      <AstrologersSection />
      <OnlinePoojaSection />
      <AstrologyServicesSection />
      <CalculatorsSection />
      {/* <PanchangSection /> */}
      <AstrologyGuidesSection />
      <AstrologerGuidanceCta />
    </main>
  );
}
