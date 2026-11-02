/** Admin shapes for `/admin/banners`. */
export type BannerStatus = "draft" | "published" | "archived";
export type BannerLinkType = "none" | "internal" | "external";
export type BannerDateState = "active" | "current" | "upcoming" | "expired";

/** `GET /admin/banners` item and detail (backend `toAdminBanner`). */
export type ManagedBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  altText: string | null;
  placement: string;
  linkType: BannerLinkType;
  linkValue: string | null;
  status: BannerStatus;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** Create and `PATCH /:id` body (status changes use `/status`). */
export type BannerInput = {
  title: string;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  altText: string | null;
  placement: string;
  linkType: BannerLinkType;
  linkValue: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
};
