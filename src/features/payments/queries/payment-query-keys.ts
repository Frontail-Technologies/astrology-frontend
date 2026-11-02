import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { PaymentListFilter, PaymentListIdFilter } from "../state/payment-list-state";

const keys = createAdminQueryKeys("payments");
const refunds = createAdminQueryKeys("refunds");

export const paymentKeys = {
  ...keys,
  list: (state: AdminListState<PaymentListFilter, PaymentListIdFilter>) => keys.list(state),
  forEntity: (entityId: string) => keys.scoped("for", entityId),
};

export const refundKeys = {
  ...refunds,
  forPayment: (paymentId: string) => refunds.scoped("payment", paymentId),
  forEntity: (entityId: string) => refunds.scoped("entity", entityId),
};
