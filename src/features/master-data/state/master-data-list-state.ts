import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import type { MasterDataEntity } from "../types/master-data-admin.ts";

export type MasterDataListFilter = "active";
export type MasterDataListIdFilter = "countryId" | "stateId";

type MasterDataListConfig = AdminListConfig<MasterDataListFilter, MasterDataListIdFilter>;

const config = (idFilters: MasterDataListIdFilter[] = []): MasterDataListConfig => ({
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 120,
  filters: { active: ["true", "false"] },
  idFilters,
});

/**
 * One stable config per entity: name search, `active` filter, and the parent id filter the API accepts
 * (`countryId` on states, `stateId` on cities).
 */
export const masterDataListConfigs: Record<MasterDataEntity, MasterDataListConfig> = {
  languages: config(),
  countries: config(),
  states: config(["countryId"]),
  cities: config(["stateId"]),
  expertise: config(),
  specialties: config(),
  tags: config(),
  "consultation-modes": config(),
  "pooja-categories": config(),
};
