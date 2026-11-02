import { isUuid, type AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { poojaFeaturedLabels, poojaStatusLabels } from "../constants/pooja-status.ts";

export type PoojaListFilter = "status" | "featured" | "categoryId";

/**
 * Allow-list that accepts any UUID. The category options come from the active pooja categories (loaded at
 * runtime), so the URL value is validated by shape here and the select renders the loaded names.
 */

export const poojaListConfig: AdminListConfig<PoojaListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 180,
  filters: { status: Object.keys(poojaStatusLabels), featured: Object.keys(poojaFeaturedLabels), categoryId: isUuid },
};
