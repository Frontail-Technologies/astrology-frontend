import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { MasterDataEntity } from "../types/master-data-admin";
import type { MasterDataListFilter, MasterDataListIdFilter } from "../state/master-data-list-state";

const keys = createAdminQueryKeys("master-data");

export const masterDataKeys = {
  all: keys.all,
  entity: (entity: MasterDataEntity) => keys.scoped(entity),
  list: (entity: MasterDataEntity, state: AdminListState<MasterDataListFilter, MasterDataListIdFilter>) => keys.scoped(entity, "list", state),
  detail: (entity: MasterDataEntity, key: string) => keys.scoped(entity, "detail", key),
  count: (entity: MasterDataEntity, active: boolean) => keys.scoped(entity, "count", active),
  options: (entity: MasterDataEntity) => keys.scoped(entity, "options"),
  /** Public (active-only) lists; outside the "admin" prefix, shared with other admin pickers. */
  publicAll: ["master-data"] as const,
  publicStates: (countryId: string) => ["master-data", "countries", countryId, "states"] as const,
};
