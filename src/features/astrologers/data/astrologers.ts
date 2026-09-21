import type { AstrologerListItem, FilterOption } from "../types/astrologer";

export const expertiseOptions: FilterOption[] = [
  { value: "all", label: "All Expertise" },
  { value: "vedic-astrology", label: "Vedic Astrology" },
  { value: "kundli", label: "Kundli" },
  { value: "compatibility", label: "Compatibility" },
  { value: "career-guidance", label: "Career Guidance" },
  { value: "relationship-astrology", label: "Relationship Astrology" },
  { value: "marriage-guidance", label: "Marriage Guidance" },
  { value: "panchang", label: "Panchang" },
];

export const languageOptions: FilterOption[] = [
  { value: "all", label: "All Languages" },
  { value: "hindi", label: "Hindi" },
  { value: "english", label: "English" },
];

export const availabilityOptions: FilterOption[] = [
  { value: "all", label: "All Availability" },
  { value: "bookable", label: "Available for booking" },
  { value: "soon", label: "Booking opens soon" },
];

export const sortOptions: FilterOption[] = [
  { value: "recommended", label: "Recommended" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

export const astrologers: AstrologerListItem[] = [
  {
    id: "ast-anay-sharma",
    slug: "anay-sharma",
    name: "Anay Sharma",
    initials: "AS",
    avatarSrc: "/assets/astrology/avatars/astrologer-01.png",
    primaryExpertise: "Vedic Astrology",
    expertiseKey: "vedic-astrology",
    specialties: ["Kundli", "Career", "Panchang"],
    languages: ["Hindi", "English"],
    availability: "bookable",
    detail: {
      role: "Vedic Astrologer",
      intro:
        "A calm, structured approach to Vedic astrology, reading the birth chart as a framework for reflection on career, timing and everyday direction.",
      bio: [
        "Anay works within the Vedic tradition, using the Kundli as a starting point for thoughtful conversation rather than fixed conclusions.",
        "Sessions typically move from what is on your mind to the chart factors that may be relevant, with Panchang timing shared as context, not instruction.",
        "The aim is clarity and perspective. Astrology is offered here as traditional guidance for reflection, not as a certainty about outcomes.",
      ],
      guidanceAreas: [
        { title: "Kundli reading", description: "A walk-through of the birth chart and the themes it traditionally points to." },
        { title: "Career reflection", description: "Considering strengths and phases of work life through a Vedic lens." },
        { title: "Panchang context", description: "Understanding day-level timing concepts in plain language." },
      ],
      approachFocus:
        "Starts with your question, then relates it to relevant chart themes in plain, unhurried language.",
      consultationModes: ["Chat", "Voice"],
      relatedSlugs: ["arjun-menon", "rohan-joshi", "devika-rao"],
    },
  },
  {
    id: "ast-meera-iyer",
    slug: "meera-iyer",
    name: "Meera Iyer",
    initials: "MI",
    avatarSrc: "/assets/astrology/avatars/astrologer-02.png",
    primaryExpertise: "Relationship Astrology",
    expertiseKey: "relationship-astrology",
    specialties: ["Compatibility", "Marriage", "Relationships"],
    languages: ["English", "Hindi"],
    availability: "soon",
    detail: {
      role: "Relationship Astrologer",
      intro:
        "Gentle, reflective guidance on relationships and compatibility, grounded in traditional Vedic principles.",
      bio: [
        "Meera focuses on relationship astrology: how two charts are traditionally compared and what that may suggest about shared strengths and areas to be mindful of.",
        "She frames compatibility as a conversation starter for partners and families, never a verdict on whether a relationship should continue.",
        "Her style is warm and unhurried, with an emphasis on self-understanding and communication.",
      ],
      guidanceAreas: [
        { title: "Compatibility reading", description: "Comparing two birth profiles for traditional harmony and friction themes." },
        { title: "Marriage reflection", description: "Considering readiness and priorities around marriage." },
        { title: "Relationship patterns", description: "Exploring recurring themes in personal relationships." },
      ],
      approachFocus:
        "Listens first, then relates chart themes to your relationship priorities without predicting outcomes.",
      consultationModes: ["Chat", "Video"],
      relatedSlugs: ["kavya-nair", "isha-kapoor", "anay-sharma"],
    },
  },
  {
    id: "ast-rohan-joshi",
    slug: "rohan-joshi",
    name: "Rohan Joshi",
    initials: "RJ",
    avatarSrc: "/assets/astrology/avatars/astrologer-03.png",
    primaryExpertise: "Career Guidance",
    expertiseKey: "career-guidance",
    specialties: ["Career", "Kundli", "Timing"],
    languages: ["Hindi", "English"],
    availability: "bookable",
    detail: {
      role: "Career Guidance Astrologer",
      intro:
        "Practical, grounded astrology for people weighing career decisions and looking for perspective on timing.",
      bio: [
        "Rohan offers career-focused astrology, using the Kundli and planetary periods as a lens on strengths, working style and phases of change.",
        "He is careful to separate traditional interpretation from professional advice. Chart themes are prompts for reflection, not instructions.",
        "Sessions suit people considering a transition or simply wanting a structured way to think about direction.",
      ],
      guidanceAreas: [
        { title: "Career themes", description: "Traditional indicators of aptitude and work style in the chart." },
        { title: "Timing perspective", description: "Reflecting on planetary periods as phases, not deadlines." },
        { title: "Kundli overview", description: "A general chart walk-through to frame the conversation." },
      ],
      approachFocus:
        "Turns chart themes into questions worth reflecting on, leaving decisions with you.",
      consultationModes: ["Chat", "Voice"],
      relatedSlugs: ["anay-sharma", "arjun-menon", "devika-rao"],
    },
  },
  {
    id: "ast-kavya-nair",
    slug: "kavya-nair",
    name: "Kavya Nair",
    initials: "KN",
    avatarSrc: "/assets/astrology/avatars/astrologer-04.png",
    primaryExpertise: "Compatibility",
    expertiseKey: "compatibility",
    specialties: ["Compatibility", "Marriage", "Kundli"],
    languages: ["English", "Hindi"],
    availability: "soon",
    detail: {
      role: "Compatibility Astrologer",
      intro:
        "Thoughtful Kundli compatibility guidance for couples and families exploring a match.",
      bio: [
        "Kavya specialises in compatibility: comparing charts to describe traditional points of harmony and points that may need attention.",
        "Her explanations stay descriptive: what a factor traditionally represents, and how couples sometimes reflect on it together.",
        "She encourages open conversation and treats astrology as one perspective among many.",
      ],
      guidanceAreas: [
        { title: "Kundli matching", description: "Traditional chart comparison explained step by step." },
        { title: "Marriage guidance", description: "Reflecting on shared priorities before a commitment." },
        { title: "Kundli basics", description: "A gentle introduction to the two charts involved." },
      ],
      approachFocus:
        "Explains each compatibility factor plainly and invites both people into the conversation.",
      consultationModes: ["Chat", "Video"],
      relatedSlugs: ["meera-iyer", "isha-kapoor", "devika-rao"],
    },
  },
  {
    id: "ast-devika-rao",
    slug: "devika-rao",
    name: "Devika Rao",
    initials: "DR",
    avatarSrc: "/assets/astrology/avatars/astrologer-02.png",
    primaryExpertise: "Kundli",
    expertiseKey: "kundli",
    specialties: ["Birth Chart", "Houses", "Planetary Periods"],
    languages: ["Hindi"],
    availability: "bookable",
    detail: {
      role: "Kundli Astrologer",
      intro:
        "Clear, patient explanations of the birth chart: houses, planets and the periods that shape a life story.",
      bio: [
        "Devika focuses on helping people understand their own Kundli: what the houses represent, how planets are traditionally read and what planetary periods mean.",
        "She prefers teaching over telling, so you leave with a better understanding of your chart and its vocabulary.",
        "Hindi-language sessions make traditional terms familiar and approachable.",
      ],
      guidanceAreas: [
        { title: "Birth chart walk-through", description: "A structured tour of your chart, one theme at a time." },
        { title: "Houses", description: "What each house traditionally represents in daily life." },
        { title: "Planetary periods", description: "How dasha periods are read as phases of emphasis." },
      ],
      approachFocus:
        "Explains the chart step by step so you can follow the reasoning behind each observation.",
      consultationModes: ["Chat", "Voice"],
      relatedSlugs: ["anay-sharma", "rohan-joshi", "arjun-menon"],
    },
  },
  {
    id: "ast-nikhil-bhat",
    slug: "nikhil-bhat",
    name: "Nikhil Bhat",
    initials: "NB",
    avatarSrc: "/assets/astrology/avatars/astrologer-03.png",
    primaryExpertise: "Panchang",
    expertiseKey: "panchang",
    specialties: ["Panchang", "Timing", "Daily Guidance"],
    languages: ["English"],
    availability: "soon",
    detail: {
      role: "Panchang Astrologer",
      intro:
        "Day-level timing guidance in plain English, based on the traditional Panchang.",
      bio: [
        "Nikhil works with the Panchang (tithi, nakshatra and related timing concepts) to help people understand how days are traditionally read.",
        "His approach is descriptive: what a time window traditionally signifies, and how people sometimes use it to plan with more awareness.",
        "Ideal for those curious about Panchang who want a friendly, English-language explanation.",
      ],
      guidanceAreas: [
        { title: "Panchang reading", description: "Understanding the elements of a day in the traditional calendar." },
        { title: "Timing awareness", description: "Reflecting on traditional auspicious-timing concepts." },
        { title: "Daily guidance", description: "A simple daily-rhythm perspective for personal planning." },
      ],
      approachFocus:
        "Translates traditional timing terms into plain language you can apply to everyday planning.",
      consultationModes: ["Chat"],
      relatedSlugs: ["anay-sharma", "arjun-menon", "devika-rao"],
    },
  },
  {
    id: "ast-isha-kapoor",
    slug: "isha-kapoor",
    name: "Isha Kapoor",
    initials: "IK",
    avatarSrc: "/assets/astrology/avatars/astrologer-04.png",
    primaryExpertise: "Marriage Guidance",
    expertiseKey: "marriage-guidance",
    specialties: ["Marriage", "Compatibility", "Relationships"],
    languages: ["Hindi", "English"],
    availability: "bookable",
    detail: {
      role: "Marriage Guidance Astrologer",
      intro:
        "Supportive, respectful guidance for individuals and families considering marriage.",
      bio: [
        "Isha offers marriage guidance rooted in Vedic tradition, using charts to prompt reflection on values, expectations and family context.",
        "She is mindful that marriage decisions are deeply personal, so her guidance is framed as perspective, never pressure or prediction.",
        "Sessions are conducted in Hindi or English, whichever feels most comfortable.",
      ],
      guidanceAreas: [
        { title: "Marriage reflection", description: "Thinking through priorities and readiness with chart context." },
        { title: "Compatibility", description: "Traditional comparison of two charts as a discussion aid." },
        { title: "Relationships", description: "Understanding communication themes between partners." },
      ],
      approachFocus:
        "Creates space for the questions you actually have, offering perspective rather than answers.",
      consultationModes: ["Chat", "Voice", "Video"],
      relatedSlugs: ["kavya-nair", "meera-iyer", "devika-rao"],
    },
  },
  {
    id: "ast-arjun-menon",
    slug: "arjun-menon",
    name: "Arjun Menon",
    initials: "AM",
    avatarSrc: "/assets/astrology/avatars/astrologer-01.png",
    primaryExpertise: "Vedic Astrology",
    expertiseKey: "vedic-astrology",
    specialties: ["Kundli", "Planetary Periods", "Career"],
    languages: ["English"],
    availability: "soon",
    detail: {
      role: "Vedic Astrologer",
      intro:
        "Methodical Vedic astrology in English, with a focus on planetary periods and long-term perspective.",
      bio: [
        "Arjun studies the Kundli through planetary periods, describing how different phases are traditionally associated with different emphases in life.",
        "He keeps explanations practical and avoids absolutes. Periods are described as themes to be aware of, not events that must occur.",
        "English-language sessions are well suited to those new to Vedic terminology.",
      ],
      guidanceAreas: [
        { title: "Planetary periods", description: "Reading dasha phases as broad themes of emphasis." },
        { title: "Kundli analysis", description: "A methodical overview of the chart's major features." },
        { title: "Career perspective", description: "Reflecting on work life across different phases." },
      ],
      approachFocus:
        "Places your questions within the larger arc of your chart while leaving room for choice.",
      consultationModes: ["Chat", "Video"],
      relatedSlugs: ["anay-sharma", "rohan-joshi", "nikhil-bhat"],
    },
  },
];

/** Shared three-step consultation outline (mechanics shared, focus per astrologer). */
export const consultationSteps = [
  {
    title: "Share your concern",
    description:
      "Tell the astrologer what you would like perspective on, in your own words.",
  },
  {
    title: "Review relevant details",
    description:
      "Birth details may be reviewed where they are relevant to the question.",
  },
  {
    title: "Receive reflective guidance",
    description:
      "Traditional astrological perspective for personal reflection, not a prediction.",
  },
];

export function getAstrologerBySlug(
  slug: string,
): AstrologerListItem | undefined {
  return astrologers.find((astrologer) => astrologer.slug === slug);
}

/** Related profiles: curated `relatedSlugs` first, then expertise/language overlap. */
export function getRelatedAstrologers(
  astrologer: AstrologerListItem,
  limit = 3,
): AstrologerListItem[] {
  const picked: AstrologerListItem[] = [];
  for (const slug of astrologer.detail?.relatedSlugs ?? []) {
    const match = getAstrologerBySlug(slug);
    if (match && match.slug !== astrologer.slug) picked.push(match);
  }
  if (picked.length < limit) {
    const score = (a: AstrologerListItem) =>
      a.specialties.filter((s) => astrologer.specialties.includes(s)).length +
      a.languages.filter((l) => astrologer.languages.includes(l)).length;
    for (const a of astrologers
      .filter((a) => a.slug !== astrologer.slug && !picked.includes(a))
      .sort((x, y) => score(y) - score(x))) {
      if (picked.length >= limit) break;
      picked.push(a);
    }
  }
  return picked.slice(0, limit);
}

export function availabilityLabel(availability: AstrologerListItem["availability"]) {
  return availability === "bookable"
    ? "Available for booking"
    : "Booking opens soon";
}
