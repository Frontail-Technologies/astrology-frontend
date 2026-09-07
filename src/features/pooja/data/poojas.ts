import type {
  PoojaCategoryOption,
  PoojaDefinition,
  PoojaRitualStep,
} from "../types/pooja";

const IMAGE_BASE = "/assets/astrology/pooja";

/**
 * Single source of truth for Online Pooja discovery AND the `/pooja/[slug]`
 * detail screen. All entries are `coming-soon` — no booking, priest
 * assignment, payment or livestream exists. Copy stays descriptive/devotional
 * per CONTENT_AND_SAFETY.md: no guaranteed outcomes, no fear-based language,
 * no invented ritual precision (mantra text, counts, samagri, Muhurat rules,
 * duration or price).
 */

// The online request flow is identical for every ritual, so this checklist is
// shared. Ritual-specific inputs are handled contextually, not hard-coded.
const BASE_REQUIRED_DETAILS = [
  "Your name, and the names of family members if the ritual is performed on their behalf",
  "The general intention or occasion you have in mind",
  "A preferred date or timeframe",
  "Any relevant family details, if the ritual format requires them",
  "Any ritual-specific information requested before confirmation",
];

const BASE_PREPARATION = [
  "Read through the ritual description so you know what it involves.",
  "Keep the required details ready before you send the request.",
  "Be clear about the occasion or intention behind the ritual.",
  "Follow any preparation guidance shared with you before the request is confirmed.",
];

// Ritual structure is broadly shared within a tradition-family. Steps stay
// high-level and use "may include" / "typically" language.
function devotionSteps(deity: string, offering: string): PoojaRitualStep[] {
  return [
    {
      title: "Sankalp",
      description:
        "A short statement of intention that sets the purpose and context of the ritual.",
    },
    {
      title: "Invocation",
      description: `${deity} is invoked with traditional opening prayers.`,
    },
    {
      title: "Traditional offerings",
      description: `${offering} and other customary offerings may be presented during the ritual.`,
    },
    {
      title: "Prayer and recitation",
      description:
        "Verses and prayers associated with the tradition are recited by the officiating priest.",
    },
    {
      title: "Aarti and closing prayer",
      description:
        "The ritual typically closes with aarti and a concluding prayer of gratitude.",
    },
  ];
}

function shivaSteps(focus: string): PoojaRitualStep[] {
  return [
    {
      title: "Sankalp",
      description:
        "A short statement of intention that sets the purpose and context of the ritual.",
    },
    {
      title: "Invocation",
      description: "Lord Shiva is invoked with traditional opening prayers.",
    },
    {
      title: "Abhishek",
      description: `${focus} Water, milk and other customary substances may be used, depending on the ritual format.`,
    },
    {
      title: "Offerings and recitation",
      description:
        "Bilva leaves and other traditional offerings may be presented while associated verses are recited.",
    },
    {
      title: "Aarti and closing prayer",
      description:
        "The ritual typically closes with aarti and a concluding prayer of gratitude.",
    },
  ];
}

function planetarySteps(focus: string): PoojaRitualStep[] {
  return [
    {
      title: "Sankalp",
      description:
        "A short statement of intention that sets the purpose and context of the ritual.",
    },
    {
      title: "Invocation",
      description: `${focus} are invoked with traditional prayers in the Vedic sequence.`,
    },
    {
      title: "Traditional offerings",
      description:
        "Grains, cloth colours and other customary offerings associated with each planet may be presented.",
    },
    {
      title: "Recitation",
      description:
        "Verses and prayers associated with the planetary deities are recited by the officiating priest.",
    },
    {
      title: "Aarti and closing prayer",
      description:
        "The ritual typically closes with aarti and a concluding prayer of gratitude.",
    },
  ];
}

export const poojas: PoojaDefinition[] = [
  {
    slug: "ganesh-pooja",
    name: "Ganesh Pooja",
    shortDescription:
      "A traditional Pooja commonly associated with auspicious beginnings.",
    imageSrc: `${IMAGE_BASE}/11-ganesha-puja.png`,
    categories: ["new-beginnings", "devotion"],
    featured: true,
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Ganesh Pooja is a traditional devotional ritual associated with Lord Ganesha, who is commonly honoured at the start of important personal or family events.",
        "In many households it is performed before beginning something new — a move, a ceremony, a venture or a season of study — as a mark of respect and a moment of focus before the work ahead.",
        "The ritual is presented here for its cultural and devotional meaning. It is a practice of intention and observance, not a guarantee of any specific result.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / devotional" },
        { label: "Focus", value: "Lord Ganesha; auspicious beginnings" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: devotionSteps("Lord Ganesha", "Flowers, durva grass and modak"),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "satyanarayan-pooja",
        "lakshmi-ganesha-pooja",
        "lakshmi-pooja",
        "saraswati-pooja",
      ],
      optionalSection: {
        title: "Common occasions",
        body: [
          "Ganesh Pooja is often chosen around new beginnings and family milestones — for example moving into a new home, starting a new venture, a naming ceremony, or the beginning of an academic year.",
          "The occasion you have in mind can be shared as part of the request so the ritual context is clear.",
        ],
      },
    },
  },
  {
    slug: "satyanarayan-pooja",
    name: "Satyanarayan Pooja",
    shortDescription:
      "A devotional ritual performed for spiritual observance and family occasions.",
    imageSrc: `${IMAGE_BASE}/09-satyanarayan-puja.png`,
    categories: ["family-wellbeing", "devotion"],
    featured: true,
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Satyanarayan Pooja is a devotional ritual dedicated to a form of Lord Vishnu, traditionally performed as an act of family observance and thanksgiving.",
        "It is commonly held on full-moon days and around household occasions, and often includes the reading of the associated traditional narrative.",
        "The ritual is presented for its devotional and cultural meaning as a shared family practice, not as a promise of any particular outcome.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / Vaishnava devotional" },
        { label: "Focus", value: "Lord Vishnu; family observance and gratitude" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: [
        {
          title: "Sankalp",
          description:
            "A short statement of intention that sets the purpose and context of the ritual.",
        },
        {
          title: "Invocation",
          description: "Lord Vishnu is invoked with traditional opening prayers.",
        },
        {
          title: "Katha reading",
          description:
            "The traditional Satyanarayan narrative is read aloud as part of the observance.",
        },
        {
          title: "Traditional offerings",
          description:
            "Fruit, panchamrit and other customary offerings may be presented during the ritual.",
        },
        {
          title: "Aarti and prasad",
          description:
            "The ritual typically closes with aarti and the sharing of prasad.",
        },
      ],
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "ganesh-pooja",
        "vishnu-pooja",
        "lakshmi-pooja",
        "durga-pooja",
      ],
      optionalSection: {
        title: "Family and devotional occasions",
        body: [
          "Satyanarayan Pooja is often performed after a significant family event, on anniversaries, or simply as a periodic act of household observance.",
          "It is commonly treated as a shared occasion where family members gather for the reading and the closing aarti.",
        ],
      },
    },
  },
  {
    slug: "rudrabhishek",
    name: "Rudrabhishek",
    shortDescription:
      "A Shiva-focused ritual centred around Abhishek and traditional worship.",
    imageSrc: `${IMAGE_BASE}/14-rudrabhishek-puja.png`,
    categories: ["shiva", "devotion"],
    featured: true,
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Rudrabhishek is a Shiva-focused ritual built around Abhishek — the ceremonial bathing of the Shivling — accompanied by the recitation of traditional Rudra verses.",
        "It is a well-known form of devotional worship in the Shaiva tradition and is often chosen by those with an established practice of Shiva worship.",
        "The ritual is presented for its devotional and cultural meaning. It is an act of observance and focus, not a guaranteed remedy for any situation.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / Shaiva devotional" },
        { label: "Focus", value: "Lord Shiva; Abhishek and Rudra recitation" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: shivaSteps(
        "The Shivling is bathed in a continuous ceremonial sequence while Rudra verses are recited.",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "maha-shivling-pooja",
        "shiva-abhishek",
        "navgraha-pooja",
        "kaal-sarp-pooja",
      ],
      optionalSection: {
        title: "Abhishek-focused overview",
        body: [
          "The defining element of Rudrabhishek is the Abhishek itself — a sustained ceremonial bathing of the Shivling using water, milk and other customary substances, depending on the ritual format.",
          "The recitation that accompanies it is drawn from traditional Rudra verses. Specific verse selections and sequence are determined by the officiating priest.",
        ],
      },
    },
  },
  {
    slug: "navgraha-pooja",
    name: "Navgraha Pooja",
    shortDescription:
      "A ritual focused on the nine planetary deities in Vedic tradition.",
    imageSrc: `${IMAGE_BASE}/12-navgraha-puja.png`,
    categories: ["planetary"],
    featured: true,
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Navgraha Pooja is a ritual addressed to the nine planetary deities of Vedic tradition — the Navgraha — through a traditional sequence of invocation and offerings.",
        "It is often chosen by people who follow planetary observances as part of their practice, or around a period they consider significant in their chart.",
        "The ritual is presented for its devotional and cultural meaning. It is an observance, not a claim to change planetary positions or guarantee outcomes.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / planetary" },
        { label: "Focus", value: "The nine Navgraha deities" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: planetarySteps("The nine planetary deities"),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "mangal-graha-pooja",
        "kaal-sarp-pooja",
        "rudrabhishek",
        "durga-pooja",
      ],
      optionalSection: {
        title: "Nine-graha overview",
        body: [
          "The Navgraha are traditionally listed as Surya, Chandra, Mangal, Budha, Guru, Shukra, Shani, Rahu and Ketu.",
          "In this ritual each is addressed in turn with its associated offerings and prayers. The specific sequence and offerings follow the officiating priest's tradition.",
        ],
      },
    },
  },
  {
    slug: "maha-shivling-pooja",
    name: "Maha Shivling Pooja",
    shortDescription:
      "A Shiva worship ritual centred on the Shivling with traditional offerings.",
    imageSrc: `${IMAGE_BASE}/01-maha-shivling-puja.png`,
    categories: ["shiva", "devotion"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Maha Shivling Pooja is a form of Shiva worship centred on the Shivling, with traditional offerings and prayers drawn from the Shaiva devotional tradition.",
        "It is commonly performed on Shiva-associated days and by those who keep a regular practice of Shiva worship.",
        "The ritual is presented for its devotional and cultural meaning as an act of observance, not as a guaranteed remedy.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / Shaiva devotional" },
        { label: "Focus", value: "Lord Shiva; Shivling worship" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: shivaSteps(
        "The Shivling is bathed with water, milk and other customary substances in a ceremonial sequence.",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "rudrabhishek",
        "shiva-abhishek",
        "kaal-sarp-pooja",
        "navgraha-pooja",
      ],
    },
  },
  {
    slug: "shiva-abhishek",
    name: "Shiva Abhishek",
    shortDescription:
      "A Shiva ritual centred on ceremonial Abhishek with traditional offerings.",
    imageSrc: `${IMAGE_BASE}/06-shiva-abhishek-puja.png`,
    categories: ["shiva", "devotion"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Shiva Abhishek is a devotional ritual centred on the ceremonial bathing of the Shivling, accompanied by traditional offerings and prayers.",
        "It is a widely observed form of Shiva worship and is often kept as a simple, regular practice rather than a one-time event.",
        "The ritual is presented for its devotional and cultural meaning. It is an act of observance and focus, with no guaranteed outcome.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / Shaiva devotional" },
        { label: "Focus", value: "Lord Shiva; ceremonial Abhishek" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: shivaSteps(
        "The Shivling is bathed with customary substances while associated verses are recited.",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "rudrabhishek",
        "maha-shivling-pooja",
        "navgraha-pooja",
        "hanuman-pooja",
      ],
    },
  },
  {
    slug: "lakshmi-pooja",
    name: "Lakshmi Pooja",
    shortDescription:
      "A devotional ritual dedicated to Goddess Lakshmi in Vedic tradition.",
    imageSrc: `${IMAGE_BASE}/10-lakshmi-puja.png`,
    categories: ["prosperity", "devotion"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Lakshmi Pooja is a devotional ritual dedicated to Goddess Lakshmi, traditionally associated with abundance, well-being and household harmony.",
        "It is commonly performed during Diwali, on Fridays, and around household occasions as an act of devotion and gratitude.",
        "The ritual is presented for its devotional and cultural meaning. It is an observance, not a promise of financial or material results.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / devotional" },
        { label: "Focus", value: "Goddess Lakshmi; devotion and gratitude" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: devotionSteps(
        "Goddess Lakshmi",
        "Lotus flowers, lamps and kheer",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "lakshmi-ganesha-pooja",
        "ganesh-pooja",
        "satyanarayan-pooja",
        "saraswati-pooja",
      ],
    },
  },
  {
    slug: "lakshmi-ganesha-pooja",
    name: "Lakshmi Ganesha Pooja",
    shortDescription:
      "A joint devotional ritual for Lakshmi and Ganesha, often for new ventures.",
    imageSrc: `${IMAGE_BASE}/08-lakshmi-ganesha-puja.png`,
    categories: ["prosperity", "new-beginnings"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Lakshmi Ganesha Pooja is a joint devotional ritual honouring Goddess Lakshmi and Lord Ganesha together, a pairing traditionally invoked at the start of new ventures.",
        "It is commonly performed at Diwali, on the opening of a business or workspace, and around other fresh starts.",
        "The ritual is presented for its devotional and cultural meaning as a moment of intention, not as a guarantee of success or gain.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / devotional" },
        { label: "Focus", value: "Lakshmi and Ganesha; new ventures" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: devotionSteps(
        "Lord Ganesha and Goddess Lakshmi",
        "Flowers, lamps and traditional sweets",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "lakshmi-pooja",
        "ganesh-pooja",
        "saraswati-pooja",
        "satyanarayan-pooja",
      ],
    },
  },
  {
    slug: "durga-pooja",
    name: "Durga Pooja",
    shortDescription:
      "A devotional ritual dedicated to Goddess Durga with traditional offerings.",
    imageSrc: `${IMAGE_BASE}/13-durga-puja.png`,
    categories: ["devotion", "family-wellbeing"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Durga Pooja is a devotional ritual dedicated to Goddess Durga, observed with traditional offerings, recitation and aarti.",
        "It is most prominent during Navratri and is often kept as a family observance during that period.",
        "The ritual is presented for its devotional and cultural meaning. It is an act of observance, not a guaranteed remedy for any circumstance.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / Shakta devotional" },
        { label: "Focus", value: "Goddess Durga; devotion and observance" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: devotionSteps(
        "Goddess Durga",
        "Red flowers, lamps and traditional offerings",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "satyanarayan-pooja",
        "navgraha-pooja",
        "lakshmi-pooja",
        "hanuman-pooja",
      ],
    },
  },
  {
    slug: "hanuman-pooja",
    name: "Hanuman Pooja",
    shortDescription:
      "A devotional ritual dedicated to Lord Hanuman with traditional prayers.",
    imageSrc: `${IMAGE_BASE}/15-hanuman-puja.png`,
    categories: ["devotion"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Hanuman Pooja is a devotional ritual dedicated to Lord Hanuman, traditionally associated with steadiness, courage and devotion.",
        "It is commonly performed on Tuesdays and Saturdays and is often kept as a simple regular practice.",
        "The ritual is presented for its devotional and cultural meaning as an act of observance, with no guaranteed outcome.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / devotional" },
        { label: "Focus", value: "Lord Hanuman; devotion and steadiness" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: devotionSteps(
        "Lord Hanuman",
        "Sindoor, flowers and traditional offerings",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "navgraha-pooja",
        "durga-pooja",
        "rudrabhishek",
        "krishna-pooja",
      ],
    },
  },
  {
    slug: "saraswati-pooja",
    name: "Saraswati Pooja",
    shortDescription:
      "A devotional ritual dedicated to Goddess Saraswati, associated with learning.",
    imageSrc: `${IMAGE_BASE}/16-saraswati-puja.png`,
    categories: ["knowledge", "devotion"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Saraswati Pooja is a devotional ritual dedicated to Goddess Saraswati, traditionally honoured in connection with learning, study and the arts.",
        "It is most widely observed on Vasant Panchami and around the start of an academic year or a new course of study.",
        "The ritual is presented for its devotional and cultural meaning as a moment of focus and intention, not a guarantee of academic results.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / devotional" },
        { label: "Focus", value: "Goddess Saraswati; learning and the arts" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: devotionSteps(
        "Goddess Saraswati",
        "White flowers, books or instruments, and traditional offerings",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "ganesh-pooja",
        "lakshmi-ganesha-pooja",
        "lakshmi-pooja",
        "krishna-pooja",
      ],
      optionalSection: {
        title: "Learning milestones",
        body: [
          "Saraswati Pooja is often chosen around study-related milestones — the start of school or college, the beginning of an exam-preparation period, or taking up a new instrument or craft.",
          "The occasion you have in mind can be shared as part of the request.",
        ],
      },
    },
  },
  {
    slug: "krishna-pooja",
    name: "Krishna Pooja",
    shortDescription:
      "A devotional ritual dedicated to Lord Krishna with traditional offerings.",
    imageSrc: `${IMAGE_BASE}/05-krishna-puja.png`,
    categories: ["devotion"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Krishna Pooja is a devotional ritual dedicated to Lord Krishna, observed with traditional offerings, song and aarti.",
        "It is especially associated with Janmashtami and is often kept as a household devotional practice.",
        "The ritual is presented for its devotional and cultural meaning as an act of observance, with no guaranteed outcome.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / Vaishnava devotional" },
        { label: "Focus", value: "Lord Krishna; devotion and observance" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: devotionSteps(
        "Lord Krishna",
        "Tulsi leaves, butter, and traditional sweets",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "vishnu-pooja",
        "satyanarayan-pooja",
        "lakshmi-pooja",
        "hanuman-pooja",
      ],
    },
  },
  {
    slug: "vishnu-pooja",
    name: "Vishnu Pooja",
    shortDescription:
      "A devotional ritual dedicated to Lord Vishnu in Vedic tradition.",
    imageSrc: `${IMAGE_BASE}/07-vishnu-puja.png`,
    categories: ["devotion"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Vishnu Pooja is a devotional ritual dedicated to Lord Vishnu, observed with traditional offerings, recitation and aarti.",
        "It is commonly performed on Thursdays and Ekadashi days and around household occasions of thanksgiving.",
        "The ritual is presented for its devotional and cultural meaning as an act of observance, not a guaranteed remedy.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / Vaishnava devotional" },
        { label: "Focus", value: "Lord Vishnu; devotion and gratitude" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: devotionSteps(
        "Lord Vishnu",
        "Tulsi leaves, yellow flowers and panchamrit",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "satyanarayan-pooja",
        "krishna-pooja",
        "lakshmi-pooja",
        "navgraha-pooja",
      ],
    },
  },
  {
    slug: "mangal-graha-pooja",
    name: "Mangal Graha Pooja",
    shortDescription:
      "A planetary ritual focused on Mangal (Mars) in Vedic tradition.",
    imageSrc: `${IMAGE_BASE}/04-mangal-graha-puja.png`,
    categories: ["planetary"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Mangal Graha Pooja is a planetary ritual addressed to Mangal (Mars) within the Vedic tradition of planetary observances.",
        "It is often chosen by people who follow graha-specific practices, commonly on Tuesdays.",
        "The ritual is presented for its devotional and cultural meaning. It is an observance, not a claim to alter planetary influence or guarantee outcomes.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / planetary" },
        { label: "Focus", value: "Mangal (Mars)" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: planetarySteps("Mangal and the supporting planetary deities"),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "navgraha-pooja",
        "kaal-sarp-pooja",
        "hanuman-pooja",
        "rudrabhishek",
      ],
    },
  },
  {
    slug: "kaal-sarp-pooja",
    name: "Kaal Sarp Pooja",
    shortDescription:
      "A Vedic ritual associated with the Kaal Sarp yoga in a birth chart.",
    imageSrc: `${IMAGE_BASE}/03-naga-shivling-puja.png`,
    categories: ["planetary", "shiva"],
    status: "coming-soon",
    detail: {
      eyebrow: "Online Pooja",
      overview: [
        "Kaal Sarp Pooja is a Vedic ritual traditionally associated with the Kaal Sarp yoga — a chart pattern involving Rahu and Ketu — and is usually performed within a Shiva-worship framework.",
        "It is chosen by people who follow this particular observance as part of their practice.",
        "The ritual is presented for its devotional and cultural meaning. It is an observance, not a guaranteed remedy, and it does not change any chart placement.",
      ],
      quickFacts: [
        { label: "Tradition", value: "Vedic / Shaiva and planetary" },
        { label: "Focus", value: "Rahu-Ketu observance within Shiva worship" },
        { label: "Format", value: "Online request" },
        { label: "Preparation", value: "Details shared before confirmation" },
      ],
      ritualSteps: shivaSteps(
        "Abhishek is performed as part of a Shiva-centred observance associated with this ritual.",
      ),
      requiredDetails: BASE_REQUIRED_DETAILS,
      preparationNotes: BASE_PREPARATION,
      relatedSlugs: [
        "navgraha-pooja",
        "rudrabhishek",
        "mangal-graha-pooja",
        "maha-shivling-pooja",
      ],
    },
  },
];

export const poojaCategories: PoojaCategoryOption[] = [
  { value: "all", label: "All" },
  { value: "new-beginnings", label: "New Beginnings" },
  { value: "family-wellbeing", label: "Family & Wellbeing" },
  { value: "devotion", label: "Devotion" },
  { value: "planetary", label: "Planetary Rituals" },
  { value: "knowledge", label: "Knowledge" },
  { value: "prosperity", label: "Prosperity" },
  { value: "shiva", label: "Shiva Worship" },
];

export const featuredPoojas = poojas.filter((pooja) => pooja.featured);

export function getPoojaBySlug(slug: string): PoojaDefinition | undefined {
  return poojas.find((pooja) => pooja.slug === slug);
}

export function getRelatedPoojas(pooja: PoojaDefinition): PoojaDefinition[] {
  return pooja.detail.relatedSlugs
    .map((slug) => getPoojaBySlug(slug))
    .filter((related): related is PoojaDefinition => Boolean(related))
    .slice(0, 4);
}
