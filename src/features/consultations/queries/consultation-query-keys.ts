import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { ConsultationListFilter, ConsultationListIdFilter } from "../state/consultation-list-state";

const keys = createAdminQueryKeys("consultations");

export const consultationKeys = {
  ...keys,
  list: (state: AdminListState<ConsultationListFilter, ConsultationListIdFilter>) => keys.list(state),
};
