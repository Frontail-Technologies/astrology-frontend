import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { poojaRequestStatusLabels } from "../constants/pooja-request-status.ts";

export type PoojaRequestListFilter = "status" | "pooja" | "needsPandit";

export const POOJA_FILTER_MAX_LENGTH = 180;

/** Valid free-text filter value: trimmed, non-empty, at most `max` characters (mirrors the API's `pooja` query). */
export function isPoojaFilterText(value: string, max = POOJA_FILTER_MAX_LENGTH): boolean {
  return value === value.trim() && value.length > 0 && value.length <= max;
}

/**
 * The API's `pooja` filter accepts a pooja id (what the Admin pooja picker sets) or a name fragment (older links),
 * so the URL value is validated as text. Kept as a filter slot so it lives in the URL, counts as an active filter
 * and is cleared with the others.
 */

/** URL `q` maps to the API's `customer` text filter (name, email or phone). */
export const poojaRequestListConfig: AdminListConfig<PoojaRequestListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchParam: "customer",
  searchMaxLength: 320,
  dateRange: true,
  filters: { status: Object.keys(poojaRequestStatusLabels), pooja: isPoojaFilterText, needsPandit: ["true"] },
};
