"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import type { ZodiacSign } from "@/features/horoscopes/types/horoscope-admin";
import { deleteSignCompatibility, listSignCompatibility, saveSignCompatibility } from "../api/sign-compatibility-admin-api";
import { signCompatibilityKeys } from "../queries/sign-compatibility-query-keys";
import type { SignCompatibilityInput } from "../types/sign-compatibility-admin";

export function useSignCompatibility() {
  return useAdminDetail(signCompatibilityKeys.all, (signal) => listSignCompatibility(signal));
}

export function useSaveSignCompatibility() {
  return useAdminMutation({
    mutationFn: ({ signA, signB, input }: { signA: ZodiacSign; signB: ZodiacSign; input: SignCompatibilityInput }) => saveSignCompatibility(signA, signB, input),
    invalidate: [signCompatibilityKeys.all],
    successMessage: "Compatibility saved",
    toastErrors: false,
  });
}

export function useDeleteSignCompatibility() {
  return useAdminMutation({
    mutationFn: ({ signA, signB }: { signA: ZodiacSign; signB: ZodiacSign }) => deleteSignCompatibility(signA, signB),
    invalidate: [signCompatibilityKeys.all],
    successMessage: "Entry deleted",
    toastErrors: false,
  });
}
