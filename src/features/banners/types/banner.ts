export type BannerPlacement = "homepage" | "store" | "pooja" | "consultation";
export type BannerStatus = "draft" | "active" | "scheduled" | "inactive" | "expired";
export type Banner = { id: string; title?: string; imageSrc: string; linkUrl?: string; placement: BannerPlacement; status: BannerStatus; startsAt?: string; endsAt?: string; sortOrder?: number; createdAt: string; updatedAt: string; };
