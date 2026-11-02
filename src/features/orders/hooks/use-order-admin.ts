"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { getOrder, listOrders, updateOrderStatus } from "../api/order-admin-api";
import { orderStatusLabels } from "../constants/order-status";
import { orderKeys } from "../queries/order-query-keys";
import { orderListConfig } from "../state/order-list-state";
import type { OrderStatus } from "../types/order-admin";

export function useOrderList() {
  return useAdminList(orderListConfig, orderKeys.list, listOrders);
}

export function useOrderDetail(id: string) {
  return useAdminDetail(orderKeys.detail(id), (signal) => getOrder(id, signal), Boolean(id));
}

export function useUpdateOrderStatus(id: string) {
  return useAdminMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id, status),
    invalidate: [orderKeys.all],
    successMessage: (order) => `Order ${order.orderNumber} is now ${orderStatusLabels[order.status].toLowerCase()}`,
    toastErrors: false,
  });
}
