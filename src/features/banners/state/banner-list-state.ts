import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { bannerDateStateLabels, bannerStatusLabels, isBannerPlacementFilter } from "../constants/banner-status.ts";

export type BannerListFilter = "placement" | "status" | "dateState";

export const bannerListConfig: AdminListConfig<BannerListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 200,
  filters: {
    placement: isBannerPlacementFilter,
    status: Object.keys(bannerStatusLabels),
    dateState: Object.keys(bannerDateStateLabels),
  },
};
