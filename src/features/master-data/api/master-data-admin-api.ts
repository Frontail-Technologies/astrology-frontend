import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import { apiRequest } from "@/lib/api/api-client";
import type { AdminMasterDataRecord, MasterDataDeleteResult, MasterDataEntity, MasterDataWriteInput, PublicMasterDataOption } from "../types/master-data-admin";

const base = (entity: MasterDataEntity) => `/master-data/${entity}`;

export function listMasterData(entity: MasterDataEntity, query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminMasterDataRecord>(base(entity), query, signal);
}

export function getMasterData(entity: MasterDataEntity, key: string, signal?: AbortSignal) {
  return adminGet<AdminMasterDataRecord>(`${base(entity)}/${encodeId(key)}`, { signal });
}

export function createMasterData(entity: MasterDataEntity, input: MasterDataWriteInput) {
  return adminSend<AdminMasterDataRecord>(base(entity), "POST", input);
}

export function updateMasterData(entity: MasterDataEntity, key: string, input: MasterDataWriteInput) {
  return adminSend<AdminMasterDataRecord>(`${base(entity)}/${encodeId(key)}`, "PATCH", input);
}

/** 409 `DEFAULT_LANGUAGE_REQUIRED` when deactivating the default language. */
export function setMasterDataActive(entity: MasterDataEntity, key: string, active: boolean) {
  return adminSend<AdminMasterDataRecord>(`${base(entity)}/${encodeId(key)}/status`, "PATCH", { active });
}

/** 409 `MASTER_DATA_IN_USE`, `DEFAULT_LANGUAGE_REQUIRED` or `PROTECTED_MASTER_DATA`. */
export function deleteMasterData(entity: MasterDataEntity, key: string) {
  return adminSend<MasterDataDeleteResult>(`${base(entity)}/${encodeId(key)}`, "DELETE");
}

/** Public active states of a country (non-paginated), for the city editor's country -> state cascade. */
export function listPublicStates(countryId: string, signal?: AbortSignal) {
  return apiRequest<PublicMasterDataOption[]>(`/master-data/countries/${encodeId(countryId)}/states`, { authenticated: false, signal });
}
