import type { Article, ArticleStatus } from "../types/article";

export const articleCategories = ["Astrology Guides", "Horoscope", "Relationships", "Remedies", "Spirituality", "Numerology"] as const;

export const articleStatusLabels: Record<ArticleStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

const topics = [
  ["Understanding Your Birth Chart", "understanding-your-birth-chart", "Astrology Guides", "A practical introduction to planets, houses, and aspects in a natal chart.", "/assets/astrology/calculators/ascendant.png"],
  ["A Grounded Guide to Mercury Retrograde", "grounded-guide-mercury-retrograde", "Astrology Guides", "Reflective ways to review plans and communication during Mercury retrograde.", "/assets/astrology/hero-zodiac-wheel.png"],
  ["Moon Signs and Emotional Patterns", "moon-signs-emotional-patterns", "Relationships", "Explore how the Moon sign can describe emotional needs and familiar responses.", "/assets/astrology/services/relationship-guidance.png"],
  ["Daily Rituals for a Calmer Morning", "daily-rituals-calmer-morning", "Spirituality", "Simple practices for beginning the day with attention and intention.", "/assets/astrology/pooja/17-online-pooja-hero-wide.png"],
  ["The Twelve Houses Explained", "twelve-houses-explained", "Astrology Guides", "A clear overview of the life areas represented by the twelve astrological houses.", "/assets/astrology/calculators/ascendant.png"],
  ["Compatibility Beyond Sun Signs", "compatibility-beyond-sun-signs", "Relationships", "Why communication, values, and the full chart matter more than one placement.", "/assets/astrology/services/marriage-guidance.png"],
  ["Numerology and Personal Year Cycles", "numerology-personal-year-cycles", "Numerology", "A reflective introduction to personal year themes in numerology.", "/assets/astrology/hero-zodiac-wheel.png"],
  ["Working With Saturn Transits", "working-with-saturn-transits", "Astrology Guides", "How Saturn periods can invite patience, structure, and realistic commitments.", "/assets/astrology/services/career-guidance.png"],
  ["Mindful Remedies for Busy Weeks", "mindful-remedies-busy-weeks", "Remedies", "Accessible routines that support focus without promising fixed outcomes.", "/assets/astrology/pooja/12-navgraha-puja.png"],
  ["A New Moon Reflection Practice", "new-moon-reflection-practice", "Spirituality", "Use the new moon as a recurring prompt for review and deliberate goal setting.", "/assets/astrology/pooja/16-saraswati-puja.png"],
  ["Reading a Monthly Horoscope", "reading-a-monthly-horoscope", "Horoscope", "How to use monthly horoscope themes as prompts rather than certainties.", "/assets/astrology/zodiac/zodiac-libra.png"],
  ["Venus and Relationship Values", "venus-and-relationship-values", "Relationships", "A balanced look at Venus as a symbol of preference, connection, and values.", "/assets/astrology/services/relationship-guidance.png"],
] as const;

const statuses: ArticleStatus[] = ["published", "published", "scheduled", "draft", "published", "archived", "scheduled", "published", "draft", "published", "draft", "archived"];

export const articleSeedData: Article[] = topics.map(([title, slug, category, excerpt, heroImage], index) => {
  const status = statuses[index];
  const createdAt = new Date(Date.UTC(2026, 5, index + 2, 8)).toISOString();
  const updatedAt = new Date(Date.UTC(2026, 8, index + 8, 10)).toISOString();
  return {
    id: `article-${String(index + 1).padStart(2, "0")}`,
    slug,
    title,
    excerpt,
    content: `${excerpt}\n\nUse this guide as a starting point for observation and reflection. Astrology can offer a useful symbolic language, while personal context and considered choices remain essential.\n\nReturn to these themes over time and note what feels relevant in your own experience.`,
    heroImage,
    category,
    tags: index % 2 ? ["reflection", "astrology"] : ["beginners", "guide"],
    author: index % 3 === 0 ? "Editorial team" : "Ananya Sharma",
    status,
    publishedAt: status === "published" ? updatedAt : undefined,
    scheduledAt: status === "scheduled" ? new Date(Date.UTC(2026, 10, index + 10, 9)).toISOString() : undefined,
    createdAt,
    updatedAt,
  };
});
