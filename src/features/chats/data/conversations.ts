import type { Conversation } from "../types/conversation";

const at = (base: string, offsetMs: number) =>
  new Date(new Date(base).getTime() + offsetMs).toISOString();

const CHT_1001_MESSAGES: Conversation["messages"] = [
  {
    id: "cht-1001-m1",
    senderType: "system",
    content: "Conversation started",
    createdAt: "2026-10-12T08:05:00Z",
  },
  {
    id: "cht-1001-m2",
    senderType: "customer",
    senderId: "cust-priya-sharma",
    content:
      "Namaste 🙏 I wanted to understand about my career prospects for the next year. Can you please guide me?",
    createdAt: "2026-10-12T08:07:00Z",
  },
  {
    id: "cht-1001-m3",
    senderType: "astrologer",
    senderId: "ast-anay-sharma",
    content:
      "Namaste Priya, Based on your kundli, the Jupiter transit looks favorable for growth in the second half of next year. I would recommend focusing on skill development during this period.",
    createdAt: "2026-10-12T08:10:00Z",
  },
  {
    id: "cht-1001-m4",
    senderType: "customer",
    senderId: "cust-priya-sharma",
    content:
      "Thank you so much for the detailed explanation! Can you also suggest any simple remedies to improve focus?",
    createdAt: "2026-10-12T08:11:00Z",
  },
  {
    id: "cht-1001-m5",
    senderType: "astrologer",
    senderId: "ast-anay-sharma",
    content:
      "Yes, you can chant 'Om Gurave Namah' 108 times daily and keep a yellow citrine crystal with you.",
    createdAt: "2026-10-12T08:12:00Z",
  },
];

const makeThread = (
  id: string,
  customerId: string,
  astrologerId: string,
  startedAt: string,
  customerOpening: string,
  astrologerReply: string,
  customerFollowup: string,
  astrologerFinal: string,
  attachment?: Conversation["messages"][number]["attachment"],
): Conversation["messages"] => [
  {
    id: `${id}-m1`,
    senderType: "system",
    content: "Conversation started",
    createdAt: startedAt,
  },
  {
    id: `${id}-m2`,
    senderType: "customer",
    senderId: customerId,
    content: customerOpening,
    createdAt: at(startedAt, 2 * 60 * 1000),
  },
  {
    id: `${id}-m3`,
    senderType: "astrologer",
    senderId: astrologerId,
    content: astrologerReply,
    createdAt: at(startedAt, 5 * 60 * 1000),
    attachment,
  },
  {
    id: `${id}-m4`,
    senderType: "customer",
    senderId: customerId,
    content: customerFollowup,
    createdAt: at(startedAt, 8 * 60 * 1000),
  },
  {
    id: `${id}-m5`,
    senderType: "astrologer",
    senderId: astrologerId,
    content: astrologerFinal,
    createdAt: at(startedAt, 10 * 60 * 1000),
  },
];

export const conversationSeedData: Conversation[] = [
  {
    id: "CHT-1001",
    customerId: "cust-priya-sharma",
    astrologerId: "ast-anay-sharma",
    consultationId: "con-1001",
    mode: "Chat",
    status: "open",
    startedAt: "2026-10-12T08:05:00Z",
    updatedAt: "2026-10-12T08:12:00Z",
    unreadCount: 3,
    lastMessagePreview:
      "Yes, you can chant 'Om Gurave Namah' 108 times daily and keep a yellow citrine crystal with you.",
    messages: CHT_1001_MESSAGES,
    internalNotes: [],
  },
  (() => {
    const msgs = makeThread(
      "CHT-1002",
      "cust-rohan-mehta",
      "ast-meera-iyer",
      "2026-10-11T06:45:00Z",
      "When will the next session be? I need to revisit my relationship question.",
      "The next best window is in 10–14 days. I'll have more clarity once Saturn exits its current degree.",
      "Thank you, I'll wait for your message.",
      "Absolutely, I'll reach out once the timing aligns. Take care until then.",
    );
    return {
      id: "CHT-1002",
      customerId: "cust-rohan-mehta",
      astrologerId: "ast-meera-iyer",
      consultationId: "con-1002",
      mode: "Video" as const,
      status: "closed" as const,
      startedAt: "2026-10-11T06:45:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 0,
      lastMessagePreview:
        "Absolutely, I'll reach out once the timing aligns. Take care until then.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1003",
      "cust-kavya-nair",
      "ast-rohan-joshi",
      "2026-10-10T09:20:00Z",
      "Can you suggest a remedy routine for improving my health and energy levels?",
      "Based on your chart, a daily practice of Surya Namaskar and chanting 'Om Suryaya Namah' at sunrise will be beneficial.",
      "Should I also avoid any specific foods or activities?",
      "Yes, reducing cold and raw foods on Mondays would support the remedy. Consistency matters most.",
      { type: "document", name: "birth-details.pdf" },
    );
    return {
      id: "CHT-1003",
      customerId: "cust-kavya-nair",
      astrologerId: "ast-rohan-joshi",
      consultationId: "con-1003",
      mode: "Chat" as const,
      status: "open" as const,
      startedAt: "2026-10-10T09:20:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 5,
      lastMessagePreview:
        "Yes, reducing cold and raw foods on Mondays would support the remedy. Consistency matters most.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1004",
      "cust-vikram-reddy",
      "ast-devika-rao",
      "2026-10-09T05:40:00Z",
      "Call was very helpful, thank you. I had a question about the timing concern we discussed.",
      "The Dasha period you asked about shifts in March. That window is more favorable for major decisions.",
      "That's very reassuring. I'll plan accordingly.",
      "Please do. Patience through the current phase will serve you well.",
    );
    return {
      id: "CHT-1004",
      customerId: "cust-vikram-reddy",
      astrologerId: "ast-devika-rao",
      consultationId: "con-1004",
      mode: "Voice" as const,
      status: "flagged" as const,
      startedAt: "2026-10-09T05:40:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 0,
      lastMessagePreview:
        "Please do. Patience through the current phase will serve you well.",
      messages: msgs,
      internalNotes: [
        {
          id: "CHT-1004-note",
          content: "Review context before changing the conversation status.",
          createdAt: msgs[msgs.length - 1].createdAt,
          author: "Admin",
        },
      ],
      flagReason: "Privacy concern",
      flaggedAt: msgs[msgs.length - 1].createdAt,
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1005",
      "cust-meena-joshi",
      "ast-anay-sharma",
      "2026-10-08T10:10:00Z",
      "Please share the mantras you recommended. I want to start this week.",
      "Here they are: Om Namah Shivaya (108 times, morning), Om Shanti (21 times, evening). Start on a Monday.",
      "Thank you, I'll begin Monday. Any specific mala beads you'd suggest?",
      "Rudraksha mala is ideal. Five-mukhi is most suitable for general spiritual practice.",
    );
    return {
      id: "CHT-1005",
      customerId: "cust-meena-joshi",
      astrologerId: "ast-anay-sharma",
      consultationId: "con-1005",
      mode: "Chat" as const,
      status: "open" as const,
      startedAt: "2026-10-08T10:10:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 2,
      lastMessagePreview:
        "Rudraksha mala is ideal. Five-mukhi is most suitable for general spiritual practice.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1006",
      "cust-arjun-pillai",
      "ast-meera-iyer",
      "2026-10-07T07:00:00Z",
      "Is this date suitable for my travel plans? I'm planning to leave in mid-October.",
      "Mid-October looks mixed. After the 18th would be considerably more auspicious for travel.",
      "I'll reschedule to the 20th then. Thank you.",
      "That's a good choice. Safe travels, and do share how things go.",
    );
    return {
      id: "CHT-1006",
      customerId: "cust-arjun-pillai",
      astrologerId: "ast-meera-iyer",
      consultationId: "con-1006",
      mode: "Video" as const,
      status: "closed" as const,
      startedAt: "2026-10-07T07:00:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 0,
      lastMessagePreview:
        "That's a good choice. Safe travels, and do share how things go.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1007",
      "cust-sunita-gupta",
      "ast-rohan-joshi",
      "2026-10-06T04:30:00Z",
      "Thank you 🙏 The guidance on the family decision was very helpful.",
      "I'm glad it helped. The coming month has Venus well-placed for family matters — a good time for conversations.",
      "I'll keep that in mind. Should I schedule a follow-up?",
      "Yes, a follow-up in 3–4 weeks would be ideal to review progress.",
    );
    return {
      id: "CHT-1007",
      customerId: "cust-sunita-gupta",
      astrologerId: "ast-rohan-joshi",
      consultationId: "con-1007",
      mode: "Chat" as const,
      status: "open" as const,
      startedAt: "2026-10-06T04:30:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 1,
      lastMessagePreview:
        "Yes, a follow-up in 3–4 weeks would be ideal to review progress.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1008",
      "cust-deepak-verma",
      "ast-devika-rao",
      "2026-10-05T11:15:00Z",
      "I wanted a chart overview focusing on my career and finances for the next two years.",
      "Your chart shows Saturn in the 10th house strengthening professional discipline. Expect slow but steady advancement through late 2027.",
      "That matches what I've been feeling. Anything I can do to accelerate things?",
      "Focus on developing expertise in one area rather than spreading across multiple domains. Depth favors you now.",
    );
    return {
      id: "CHT-1008",
      customerId: "cust-deepak-verma",
      astrologerId: "ast-devika-rao",
      consultationId: "con-1008",
      mode: "Voice" as const,
      status: "closed" as const,
      startedAt: "2026-10-05T11:15:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 0,
      lastMessagePreview:
        "Focus on developing expertise in one area rather than spreading across multiple domains.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1009",
      "cust-aisha-khan",
      "ast-anay-sharma",
      "2026-10-04T06:30:00Z",
      "I had a consultation follow-up question about the planetary period you mentioned.",
      "The Rahu period ends mid-2027. After that, Jupiter takes over which is highly favorable for your chart.",
      "That's good to know. Should I plan any big decisions before or after the transition?",
      "I'd advise waiting until late 2027 for irreversible major decisions. Smaller moves are fine now.",
    );
    return {
      id: "CHT-1009",
      customerId: "cust-aisha-khan",
      astrologerId: "ast-anay-sharma",
      consultationId: undefined,
      mode: "Chat" as const,
      status: "flagged" as const,
      startedAt: "2026-10-04T06:30:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 0,
      lastMessagePreview:
        "I'd advise waiting until late 2027 for irreversible major decisions. Smaller moves are fine now.",
      messages: msgs,
      internalNotes: [
        {
          id: "CHT-1009-note",
          content: "Review context before changing the conversation status.",
          createdAt: msgs[msgs.length - 1].createdAt,
          author: "Admin",
        },
      ],
      flagReason: "Privacy concern",
      flaggedAt: msgs[msgs.length - 1].createdAt,
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1010",
      "cust-rahul-shah",
      "ast-rohan-joshi",
      "2026-10-03T09:00:00Z",
      "I am considering multiple career options and wanted astrological guidance on which direction suits me.",
      "Mercury is strong in your chart, pointing to fields that blend communication and analysis. Technology, writing, or consulting would all suit.",
      "I've been leaning toward data analytics. Does that fit?",
      "Yes, that aligns very well. Mercury in the 10th gives you an edge in analytical roles.",
    );
    return {
      id: "CHT-1010",
      customerId: "cust-rahul-shah",
      astrologerId: "ast-rohan-joshi",
      consultationId: undefined,
      mode: "Video" as const,
      status: "open" as const,
      startedAt: "2026-10-03T09:00:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 0,
      lastMessagePreview:
        "Yes, that aligns very well. Mercury in the 10th gives you an edge in analytical roles.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1011",
      "cust-priya-sharma",
      "ast-meera-iyer",
      "2026-10-02T08:40:00Z",
      "I wanted a compatibility reading with my partner to understand our long-term potential.",
      "Your Moon and Venus positions create a harmonious emotional bond. Long-term compatibility looks strong overall.",
      "That's wonderful to hear. Are there any challenging areas we should be aware of?",
      "Communication styles differ — you prefer directness, your partner is more reflective. Patience bridges that gap well.",
    );
    return {
      id: "CHT-1011",
      customerId: "cust-priya-sharma",
      astrologerId: "ast-meera-iyer",
      consultationId: undefined,
      mode: "Voice" as const,
      status: "closed" as const,
      startedAt: "2026-10-02T08:40:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 0,
      lastMessagePreview:
        "Communication styles differ — you prefer directness, your partner is more reflective. Patience bridges that gap well.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
  (() => {
    const msgs = makeThread(
      "CHT-1012",
      "cust-kavya-nair",
      "ast-devika-rao",
      "2026-10-01T10:20:00Z",
      "I wanted to discuss establishing a daily practice. Can you guide me on timing?",
      "Early morning between 5–7 AM is ideal — Brahma Muhurta. Even 20 minutes of quiet sitting is valuable.",
      "I struggle to wake that early. Is there a secondary window?",
      "Sunset is a good secondary window, around 6–6:30 PM. Consistency at any time outweighs perfect timing.",
    );
    return {
      id: "CHT-1012",
      customerId: "cust-kavya-nair",
      astrologerId: "ast-devika-rao",
      consultationId: undefined,
      mode: "Chat" as const,
      status: "open" as const,
      startedAt: "2026-10-01T10:20:00Z",
      updatedAt: msgs[msgs.length - 1].createdAt,
      unreadCount: 1,
      lastMessagePreview:
        "Sunset is a good secondary window, around 6–6:30 PM. Consistency at any time outweighs perfect timing.",
      messages: msgs,
      internalNotes: [],
    };
  })(),
];
