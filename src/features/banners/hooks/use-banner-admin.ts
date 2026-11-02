"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { createBanner, deleteBanner, getBanner, listBanners, updateBanner, updateBannerStatus } from "../api/banner-admin-api";
import { bannerKeys } from "../queries/banner-query-keys";
import { bannerListConfig } from "../state/banner-list-state";
import type { BannerInput, BannerStatus } from "../types/banner-admin";

export function useBannerList() {
  return useAdminList(bannerListConfig, bannerKeys.list, listBanners);
}

export function useBannerDetail(id: string) {
  return useAdminDetail(bannerKeys.detail(id), (signal) => getBanner(id, signal), Boolean(id));
}

export function useCreateBanner() {
  return useAdminMutation({ mutationFn: (input: BannerInput) => createBanner(input), invalidate: [bannerKeys.all], successMessage: "Banner created as a draft", toastErrors: false });
}

export function useUpdateBanner(id: string) {
  return useAdminMutation({ mutationFn: (input: BannerInput) => updateBanner(id, input), invalidate: [bannerKeys.all], successMessage: "Banner saved", toastErrors: false });
}

export function useBannerStatusUpdate(id: string) {
  return useAdminMutation({ mutationFn: (status: BannerStatus) => updateBannerStatus(id, status), invalidate: [bannerKeys.all], successMessage: "Banner status updated", toastErrors: false });
}

/** Options for `AdminDeleteAction` (views never import the API module). */
export const bannerDeleteOptions = {
  mutationFn: deleteBanner,
  invalidate: [bannerKeys.all],
  remove: (id: string) => [bannerKeys.detail(id)],
};
