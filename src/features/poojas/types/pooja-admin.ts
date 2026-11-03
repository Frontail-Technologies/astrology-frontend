/** Admin shapes for `/admin/poojas`. Separate from the public-site `features/pooja/types/pooja.ts`. */
export type PoojaStatus = "draft" | "published" | "suspended";

export type PoojaCategoryRef = { id: string; name: string; slug: string };
export type PoojaCategoryLink = PoojaCategoryRef & { isPrimary: boolean };

export type PoojaQuickFact = { label: string; value: string };
export type PoojaRitualStep = { title: string; description: string };

/** Structured detail content (`poojas.content`); `null` when not written yet. */
export type PoojaContent = {
  eyebrow?: string;
  overview: string[];
  quickFacts: PoojaQuickFact[];
  ritualSteps: PoojaRitualStep[];
  requiredDetails: string[];
  preparationNotes: string[];
  relatedSlugs: string[];
  optionalSection?: { title: string; body: string[] };
};

/** `GET /admin/poojas` item and detail (backend `toAdminPooja`). */
export type ManagedPooja = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  /** Primary category id. */
  categoryId: string;
  imageUrl: string | null;
  pricePaise: number | null;
  durationMinutes: number | null;
  status: PoojaStatus;
  featured: boolean;
  content: PoojaContent | null;
  /** Bookings accepted per day; null = unlimited. */
  dailyCapacity: number | null;
  /** Earliest bookable date, in days from today. */
  bookingLeadDays: number;
  /** How far ahead customers can book, in days. */
  bookingWindowDays: number;
  createdAt: string;
  updatedAt: string;
  /** Primary category. */
  category: PoojaCategoryRef;
  /** Every linked category, primary first. */
  categories: PoojaCategoryLink[];
};

/** `POST /admin/poojas` body; `PATCH /admin/poojas/:id` takes the same fields without `status`. */
export type PoojaInput = {
  name: string;
  shortDescription: string;
  description: string;
  /** 1-10 unique active pooja-category ids; the first is primary. */
  categoryIds: string[];
  imageUrl: string | null;
  pricePaise: number | null;
  durationMinutes: number | null;
  featured: boolean;
  content: PoojaContent | null;
  dailyCapacity: number | null;
  bookingLeadDays: number;
  bookingWindowDays: number;
  status?: PoojaStatus;
};

export type PoojaStatusInput = { status: PoojaStatus };

/** `GET /admin/poojas/:id/packages` item: a bookable option with its own price and sankalp size. */
export type PoojaPackage = {
  id: string;
  poojaId: string;
  name: string;
  description: string;
  pricePaise: number;
  durationMinutes: number | null;
  /** Names allowed in the sankalp. */
  maxDevotees: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PoojaPackageInput = {
  name: string;
  description: string;
  pricePaise: number;
  durationMinutes: number | null;
  maxDevotees: number;
  sortOrder: number;
  active: boolean;
};

/** Deleting a package that bookings already use deactivates it instead. */
export type PoojaPackageDeleteResult = { deleted: boolean; deactivated: boolean };
