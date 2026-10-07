import type { Banner } from "../types/banner";
export const bannerSeed: Banner[] = [
  { id: "banner-diwali", title: "Diwali special offer", imageSrc: "/assets/astrology/calculators/hero-backgrounds/remedies-hero-bg.png", linkUrl: "/pooja", placement: "homepage", status: "active", startsAt: "2026-10-01", endsAt: "2026-11-15", sortOrder: 1, createdAt: "2026-09-20", updatedAt: "2026-09-20" },
  { id: "banner-talk", title: "Talk to astrologers", imageSrc: "/assets/astrology/astrologers/hero-visual-wide.png", linkUrl: "/astrologers", placement: "homepage", status: "active", sortOrder: 2, createdAt: "2026-08-01", updatedAt: "2026-08-01" },
  { id: "banner-pooja", title: "Pooja services", imageSrc: "/assets/astrology/services/kundli-consultation.png", linkUrl: "/pooja", placement: "pooja", status: "active", startsAt: "2026-09-01", endsAt: "2026-10-30", sortOrder: 1, createdAt: "2026-08-20", updatedAt: "2026-08-20" },
  { id: "banner-store", title: "Astrology store", imageSrc: "/assets/astrology/calculators/lucky-gemstone.png", linkUrl: "/admin/store/products", placement: "store", status: "scheduled", startsAt: "2026-12-01", endsAt: "2026-12-31", sortOrder: 1, createdAt: "2026-09-15", updatedAt: "2026-09-15" },
  { id: "banner-kundli", title: "Kundli guidance", imageSrc: "/assets/astrology/services/birth-chart-reading.png", linkUrl: "/calculators", placement: "consultation", status: "inactive", sortOrder: 3, createdAt: "2026-08-15", updatedAt: "2026-08-15" },
];
