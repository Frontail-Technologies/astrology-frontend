import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { BannerInput, BannerStatus, ManagedBanner } from "../types/banner-admin";

export function listBanners(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedBanner>("/banners", query, signal);
}

export function getBanner(id: string, signal?: AbortSignal) {
  return adminGet<ManagedBanner>(`/banners/${encodeId(id)}`, { signal });
}

/** New banners start as drafts. */
export function createBanner(input: BannerInput) {
  return adminSend<ManagedBanner>("/banners", "POST", input);
}

export function updateBanner(id: string, input: BannerInput) {
  return adminSend<ManagedBanner>(`/banners/${encodeId(id)}`, "PATCH", input);
}

export function updateBannerStatus(id: string, status: BannerStatus) {
  return adminSend<ManagedBanner>(`/banners/${encodeId(id)}/status`, "PATCH", { status });
}

export function deleteBanner(id: string) {
  return adminSend<{ deleted: true }>(`/banners/${encodeId(id)}`, "DELETE");
}
