/** Admin shapes for `/admin/master-data/<entity>` (backend `master-data` module). */
export const masterDataEntities = [
  "languages",
  "countries",
  "states",
  "cities",
  "expertise",
  "specialties",
  "tags",
  "consultation-modes",
  "pooja-categories",
] as const;

export type MasterDataEntity = (typeof masterDataEntities)[number];

export const consultationModeCodes = ["chat", "voice", "video"] as const;
export type ConsultationModeCode = (typeof consultationModeCodes)[number];

export type TextDirection = "ltr" | "rtl";

/**
 * Admin DTO. Fields that do not apply to an entity are `null` (or absent for the entity-specific extras). The key is
 * `id` for every entity except consultation modes, whose key is `code` (`id` is null).
 */
export type AdminMasterDataRecord = {
  id: string | null;
  code: string | null;
  name: string;
  slug: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  countryId: string | null;
  stateId: string | null;
  isDefault: boolean | null;
  /** Consultation modes only: built-in modes cannot be deleted (`PROTECTED_MASTER_DATA`). */
  protected: boolean | null;
  nativeName?: string | null;
  direction?: TextDirection | null;
  phoneCode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  technicalKey?: string | null;
  /** Live references (states of a country, astrologers using an expertise, …). Deleting needs 0. */
  usageCount: number;
};

/** Public active-only list item (`/master-data/...`, no extended columns). */
export type PublicMasterDataOption = {
  id: string | null;
  code: string | null;
  name: string;
  slug: string | null;
  countryId: string | null;
  stateId: string | null;
};

/** Body of `POST` / `PATCH /admin/master-data/<entity>[/:key]` (per-entity subsets; see `lib/master-data-payload.ts`). */
export type MasterDataWriteInput = {
  name?: string;
  slug?: string;
  code?: string;
  active?: boolean;
  sortOrder?: number;
  countryId?: string;
  stateId?: string;
  isDefault?: boolean;
  nativeName?: string | null;
  direction?: TextDirection;
  phoneCode?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  technicalKey?: string | null;
};

export type MasterDataDeleteResult = { deleted: boolean };
