"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { normalizeAdminError, type AdminError } from "./admin-errors";

/**
 * Admin mutation with the shared safety rules: never retried automatically (retry: false), errors normalized and
 * surfaced as a toast (never swallowed), and related queries invalidated only after the server confirms success.
 */
export function useAdminMutation<TInput, TResult>(options: {
  mutationFn: (input: TInput) => Promise<TResult>;
  invalidate?: QueryKey[];
  successMessage?: string | ((result: TResult, input: TInput) => string);
  /** Defaults to true; set false when the caller renders the error itself (for example inline in a dialog). */
  toastErrors?: boolean;
  /** Set 0 for disclosures (transcripts) so the response is dropped from the mutation cache once unobserved. */
  gcTime?: number;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation<TResult, AdminError, TInput>({
    mutationFn: async (input) => {
      try {
        return await options.mutationFn(input);
      } catch (error) {
        throw normalizeAdminError(error);
      }
    },
    retry: false,
    ...(options.gcTime !== undefined ? { gcTime: options.gcTime } : {}),
    onSuccess: async (result, input) => {
      await Promise.all((options.invalidate ?? []).map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      const message = typeof options.successMessage === "function" ? options.successMessage(result, input) : options.successMessage;
      if (message) toast.success(message);
    },
    onError: (error) => {
      if (options.toastErrors !== false) toast.error(error.message);
    },
  });
  return mutation;
}
