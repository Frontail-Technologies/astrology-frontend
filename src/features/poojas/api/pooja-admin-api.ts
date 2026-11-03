import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import { apiRequest } from "@/lib/api/api-client";
import type { ManagedPooja, PoojaCategoryRef, PoojaInput, PoojaPackage, PoojaPackageDeleteResult, PoojaPackageInput, PoojaStatusInput } from "../types/pooja-admin";

export function listPoojas(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedPooja>("/poojas", query, signal);
}

export function getPooja(id: string, signal?: AbortSignal) {
  return adminGet<ManagedPooja>(`/poojas/${encodeId(id)}`, { signal });
}

export function createPooja(input: PoojaInput) {
  return adminSend<ManagedPooja>("/poojas", "POST", input);
}

export function updatePooja(id: string, input: Omit<PoojaInput, "status">) {
  return adminSend<ManagedPooja>(`/poojas/${encodeId(id)}`, "PATCH", input);
}

export function updatePoojaStatus(id: string, input: PoojaStatusInput) {
  return adminSend<ManagedPooja>(`/poojas/${encodeId(id)}/status`, "PATCH", input);
}

export function listPoojaPackages(poojaId: string, signal?: AbortSignal) {
  return adminGet<PoojaPackage[]>(`/poojas/${encodeId(poojaId)}/packages`, { signal });
}

export function createPoojaPackage(poojaId: string, input: PoojaPackageInput) {
  return adminSend<PoojaPackage>(`/poojas/${encodeId(poojaId)}/packages`, "POST", input);
}

export function updatePoojaPackage(poojaId: string, packageId: string, input: Partial<PoojaPackageInput>) {
  return adminSend<PoojaPackage>(`/poojas/${encodeId(poojaId)}/packages/${encodeId(packageId)}`, "PATCH", input);
}

export function deletePoojaPackage(poojaId: string, packageId: string) {
  return adminSend<PoojaPackageDeleteResult>(`/poojas/${encodeId(poojaId)}/packages/${encodeId(packageId)}`, "DELETE");
}

export function deletePooja(id: string) {
  return adminSend<{ deleted: true }>(`/poojas/${encodeId(id)}`, "DELETE");
}

/** Active pooja categories (public master data). */
export function listPoojaCategories(signal?: AbortSignal) {
  return apiRequest<PoojaCategoryRef[]>("/master-data/pooja-categories", { authenticated: false, signal });
}
