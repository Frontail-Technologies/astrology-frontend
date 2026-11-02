import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { verificationLabels, visibilityLabels } from "../constants/astrologer-status.ts";

export type AstrologerListFilter = "verificationStatus" | "visibilityStatus";

export const astrologerListConfig: AdminListConfig<AstrologerListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 120,
  filters: { verificationStatus: Object.keys(verificationLabels), visibilityStatus: Object.keys(visibilityLabels) },
};
