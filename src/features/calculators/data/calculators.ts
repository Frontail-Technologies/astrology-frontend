import type {
  CalculatorCategory,
  CalculatorCategoryOption,
  CalculatorDefinition,
} from "../types/calculator";

const IMAGE_BASE = "/assets/astrology/calculators";

/**
 * Single source of truth for calculator discovery (Hub + Homepage).
 * All entries are `coming-soon` — no calculator engine is implemented yet.
 * Copy stays non-deterministic per CONTENT_AND_SAFETY.md.
 */
export const calculators: CalculatorDefinition[] = [
  // ---- Relationships ----
  {
    slug: "love-compatibility",
    name: "Love Compatibility Calculator",
    shortDescription:
      "Compare two birth profiles to explore relationship harmony, strengths and areas to be mindful of, based on Vedic astrology principles.",
    category: "relationships",
    imageSrc: `${IMAGE_BASE}/love-compatibility.png`,
    keywords: ["love", "compatibility", "relationship", "match", "partner", "synastry"],
    featured: true,
    status: "coming-soon",
    detail: {
      form: "love-compatibility",
      intro:
        "Provide your and your partner's birth details to explore compatibility.",
      submitLabel: "Check Compatibility",
      privacyNote:
        "Your birth details are used only for the requested astrology tool experience. Do not share sensitive information in public places.",
      sections: [
        {
          title: "Your Details",
          fields: [
            { key: "personName", label: "Name", type: "text", placeholder: "Enter your name" },
            { key: "personDob", label: "Date of Birth", type: "date", required: true },
            { key: "personTob", label: "Time of Birth", type: "time" },
            { key: "personPlace", label: "Birth Place", type: "place", placeholder: "New Delhi, India" },
          ],
        },
        {
          title: "Partner Details",
          fields: [
            { key: "partnerName", label: "Name", type: "text", placeholder: "Enter partner's name" },
            { key: "partnerDob", label: "Date of Birth", type: "date", required: true },
            { key: "partnerTob", label: "Time of Birth", type: "time" },
            { key: "partnerPlace", label: "Birth Place", type: "place", placeholder: "New Delhi, India" },
          ],
        },
      ],
      howItWorks: [
        "Enter both birth profiles with accurate birth details for you and your partner.",
        "Details are securely normalized for calculation.",
        "The approved astrology engine evaluates relevant planetary factors using Vedic principles.",
        "A structured compatibility analysis is presented for reflection.",
      ],
      resultSections: [
        "Overall Compatibility",
        "Planetary Factors",
        "Strengths",
        "Areas to Reflect On",
        "Birth Detail Summary",
      ],
      relatedSlugs: [
        "marriage-compatibility",
        "moon-sign",
        "birth-nakshatra",
        "love-calculator",
      ],
    },
  },
  {
    slug: "marriage-compatibility",
    name: "Marriage Compatibility",
    shortDescription: "Compare birth details for marriage compatibility.",
    category: "relationships",
    imageSrc: `${IMAGE_BASE}/marriage-compatibility.png`,
    keywords: ["marriage", "compatibility", "kundli matching", "guna milan", "match"],
    status: "coming-soon",
  },
  {
    slug: "marriage-biodata",
    name: "Marriage Biodata",
    shortDescription: "Build a structured marriage biodata from your details.",
    category: "relationships",
    imageSrc: `${IMAGE_BASE}/marriage-biodata.png`,
    keywords: ["marriage", "biodata", "profile", "matrimony", "shaadi"],
    status: "coming-soon",
  },
  {
    slug: "love-calculator",
    name: "Love Calculator",
    shortDescription: "Explore a playful love match using two names.",
    category: "relationships",
    imageSrc: `${IMAGE_BASE}/love-calculator.png`,
    keywords: ["love", "calculator", "name", "crush", "match", "percentage"],
    status: "coming-soon",
  },

  // ---- Birth & Chart ----
  {
    slug: "ascendant",
    name: "Ascendant Calculator",
    shortDescription: "Discover your rising sign.",
    category: "birth-chart",
    imageSrc: `${IMAGE_BASE}/ascendant.png`,
    keywords: ["ascendant", "rising sign", "lagna", "birth chart"],
    featured: true,
    status: "coming-soon",
  },
  {
    slug: "moon-sign",
    name: "Moon Sign Calculator",
    shortDescription: "Find your Moon sign from birth details.",
    category: "birth-chart",
    imageSrc: `${IMAGE_BASE}/moon-sign.png`,
    keywords: ["moon sign", "rashi", "chandra", "birth chart"],
    featured: true,
    status: "coming-soon",
  },
  {
    slug: "sun-sign",
    name: "Sun Sign Calculator",
    shortDescription: "Find your Sun sign from your birth date.",
    category: "birth-chart",
    imageSrc: `${IMAGE_BASE}/sun-sign.png`,
    keywords: ["sun sign", "zodiac", "star sign", "birth date"],
    status: "coming-soon",
  },
  {
    slug: "birth-nakshatra",
    name: "Birth Nakshatra Calculator",
    shortDescription: "Know your birth nakshatra.",
    category: "birth-chart",
    imageSrc: `${IMAGE_BASE}/birth-nakshatra.png`,
    keywords: ["nakshatra", "birth star", "constellation", "janma"],
    status: "coming-soon",
  },

  // ---- Dosha ----
  {
    slug: "mangal-dosha",
    name: "Mangal Dosha Calculator",
    shortDescription: "Explore Mangal Dosha indicators in your chart.",
    category: "dosha",
    imageSrc: `${IMAGE_BASE}/mangal-dosha.png`,
    keywords: ["mangal dosha", "manglik", "kuja dosha", "mars"],
    featured: true,
    status: "coming-soon",
  },
  {
    slug: "kaal-sarp-dosha",
    name: "Kaal Sarp Dosha Calculator",
    shortDescription: "Check for Kaal Sarp Dosha in your chart.",
    category: "dosha",
    imageSrc: `${IMAGE_BASE}/kaal-sarp-dosha.png`,
    keywords: ["kaal sarp", "dosha", "rahu", "ketu"],
    status: "coming-soon",
  },
  {
    slug: "pitra-dosha",
    name: "Pitra Dosha Calculator",
    shortDescription: "Explore Pitra Dosha indicators in your chart.",
    category: "dosha",
    imageSrc: `${IMAGE_BASE}/pitra-dosha.png`,
    keywords: ["pitra dosha", "pitru", "ancestors", "sun"],
    status: "coming-soon",
  },
  {
    slug: "shani-sade-sati",
    name: "Shani Sade Sati Calculator",
    shortDescription: "Understand your current Shani Sade Sati phase.",
    category: "dosha",
    imageSrc: `${IMAGE_BASE}/shani-sade-sati.png`,
    keywords: ["shani", "sade sati", "saturn", "dhaiya"],
    status: "coming-soon",
  },

  // ---- Numerology ----
  {
    slug: "numerology",
    name: "Numerology Calculator",
    shortDescription: "Explore numerology patterns from your details.",
    category: "numerology",
    imageSrc: `${IMAGE_BASE}/numerology.png`,
    keywords: ["numerology", "life path", "destiny number", "numbers"],
    status: "coming-soon",
  },
  {
    slug: "name-number",
    name: "Name Number Calculator",
    shortDescription: "Find your name number and what it points to.",
    category: "numerology",
    imageSrc: `${IMAGE_BASE}/name-number.png`,
    keywords: ["name number", "numerology", "chaldean", "alphabet"],
    status: "coming-soon",
  },

  // ---- Remedies & Discovery ----
  {
    slug: "lucky-gemstone",
    name: "Lucky Gemstone Calculator",
    shortDescription: "Explore gemstone suggestions based on astrology.",
    category: "remedies",
    imageSrc: `${IMAGE_BASE}/lucky-gemstone.png`,
    keywords: ["gemstone", "lucky stone", "ratna", "remedy", "birthstone"],
    status: "coming-soon",
  },
  {
    slug: "lucky-rudraksha",
    name: "Lucky Rudraksha Calculator",
    shortDescription: "Explore rudraksha suggestions based on astrology.",
    category: "remedies",
    imageSrc: `${IMAGE_BASE}/lucky-rudraksha.png`,
    keywords: ["rudraksha", "mukhi", "bead", "remedy"],
    status: "coming-soon",
  },
];

export const calculatorCategories: CalculatorCategoryOption[] = [
  { value: "all", label: "All Calculators" },
  { value: "relationships", label: "Relationships" },
  { value: "birth-chart", label: "Birth & Chart" },
  { value: "dosha", label: "Dosha" },
  { value: "numerology", label: "Numerology" },
  { value: "remedies", label: "Remedies" },
];

export const calculatorGroups: Array<{
  category: CalculatorCategory;
  title: string;
}> = [
  { category: "relationships", title: "Relationship Calculators" },
  { category: "birth-chart", title: "Birth & Chart Calculators" },
  { category: "dosha", title: "Dosha Calculators" },
  { category: "numerology", title: "Numerology" },
  { category: "remedies", title: "Remedies & Discovery" },
];

export const featuredCalculators = calculators.filter(
  (calculator) => calculator.featured,
);

/** Homepage discovery subset — resolves shared definitions by slug, in order. */
export function getCalculatorsBySlug(slugs: readonly string[]): CalculatorDefinition[] {
  return slugs
    .map((slug) => calculators.find((calculator) => calculator.slug === slug))
    .filter((calculator): calculator is CalculatorDefinition => Boolean(calculator));
}

export function getCalculatorBySlug(
  slug: string,
): CalculatorDefinition | undefined {
  return calculators.find((calculator) => calculator.slug === slug);
}

/** Calculators whose detail UI (`/calculators/[slug]`) is implemented. */
export function getReadyCalculators(): CalculatorDefinition[] {
  return calculators.filter((calculator) => calculator.detail);
}

/** A detail route exists and should be a real link (not a Sonner preview). */
export function isCalculatorReady(calculator: CalculatorDefinition): boolean {
  return Boolean(calculator.detail);
}

export function getRelatedCalculators(
  calculator: CalculatorDefinition,
): CalculatorDefinition[] {
  const slugs = calculator.detail?.relatedSlugs ?? [];
  return slugs
    .map((slug) => getCalculatorBySlug(slug))
    .filter((c): c is CalculatorDefinition => Boolean(c))
    .slice(0, 4);
}

/**
 * Category → supplied wide hero background (production assets from
 * `hero-backgrounds/`). Category atmosphere is the LAYER-1 background; each
 * calculator's own transparent PNG stays the LAYER-2 subject.
 */
const CATEGORY_HERO_BG: Record<CalculatorCategory, string> = {
  relationships: `${IMAGE_BASE}/hero-backgrounds/compatibility-hero-bg.png`,
  "birth-chart": `${IMAGE_BASE}/hero-backgrounds/birth-chart-hero-bg.png`,
  dosha: `${IMAGE_BASE}/hero-backgrounds/planetary-dosha-hero-bg.png`,
  numerology: `${IMAGE_BASE}/hero-backgrounds/numerology-hero-bg.png`,
  remedies: `${IMAGE_BASE}/hero-backgrounds/remedies-hero-bg.png`,
};

export function getCalculatorHeroBackground(
  calculator: CalculatorDefinition,
): string {
  return CATEGORY_HERO_BG[calculator.category];
}
