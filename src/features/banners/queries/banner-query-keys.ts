import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { BannerListFilter } from "../state/banner-list-state";

const keys = createAdminQueryKeys("banners");

export const bannerKeys = {
  ...keys,
  list: (state: AdminListState<BannerListFilter, never>) => keys.list(state),
};
