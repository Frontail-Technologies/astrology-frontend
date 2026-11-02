"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { getPoojaRequest, listPoojaRequests, schedulePoojaRequest, updatePoojaRequestStatus } from "../api/pooja-request-admin-api";
import { poojaRequestKeys } from "../queries/pooja-request-query-keys";
import { poojaRequestListConfig } from "../state/pooja-request-list-state";
import type { PoojaRequestScheduleInput, PoojaRequestStatusInput } from "../types/pooja-request-admin";

export function usePoojaRequestList() {
  return useAdminList(poojaRequestListConfig, poojaRequestKeys.list, listPoojaRequests);
}

export function usePoojaRequestDetail(id: string) {
  return useAdminDetail(poojaRequestKeys.detail(id), (signal) => getPoojaRequest(id, signal), Boolean(id));
}

export function usePoojaRequestStatusUpdate(id: string) {
  return useAdminMutation({
    mutationFn: (input: PoojaRequestStatusInput) => updatePoojaRequestStatus(id, input),
    invalidate: [poojaRequestKeys.all],
    successMessage: "Request updated",
    toastErrors: false,
  });
}

export function usePoojaRequestSchedule(id: string) {
  return useAdminMutation({
    mutationFn: (input: PoojaRequestScheduleInput) => schedulePoojaRequest(id, input),
    invalidate: [poojaRequestKeys.all],
    successMessage: "Schedule saved",
    toastErrors: false,
  });
}
