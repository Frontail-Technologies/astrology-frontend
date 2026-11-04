import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { AstrologerListFilter } from "../state/astrologer-list-state";

const keys = createAdminQueryKeys("astrologers");

export const astrologerKeys = {
  ...keys,
  list: (state: AdminListState<AstrologerListFilter, never>) => keys.list(state),
  picker: () => keys.scoped("picker"),
  /** Public master data; not under the "admin" prefix because it is not admin-scoped. */
  taxonomy: (entity: "expertise" | "specialties") => ["master-data", entity] as const,
  /** Public languages / countries / cities of a state for the profile editor pickers. */
  publicList: (entity: "languages" | "countries") => ["master-data", entity] as const,
  publicCities: (stateId: string) => ["master-data", "states", stateId, "cities"] as const,
  documents: (id: string) => [...keys.all, "documents", id] as const,
};
