import { apiRequest } from "@/lib/api/api-client";

export { ACCEPTED_IMAGE_TYPES } from "./media-constraints";

export type UploadedImage = {
  mediaId: string;
  url: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
};

export function uploadAdminImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  return apiRequest<UploadedImage>("/admin/media/images", { method: "POST", body });
}

export function deleteAdminMedia(mediaId: string) {
  return apiRequest<{ deleted: boolean }>(`/admin/media/${encodeURIComponent(mediaId)}`, { method: "DELETE" });
}
