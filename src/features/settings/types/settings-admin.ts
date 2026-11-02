/** `GET /admin/settings`: only the backend's allow-listed operational keys. Secrets and env values are never here. */
export type EffectiveSetting = {
  key: string;
  value: unknown;
  group: string;
  description: string;
  isPublic: boolean;
  isOverride: boolean;
  updatedByUserId: string | null;
  updatedAt: string | null;
};
