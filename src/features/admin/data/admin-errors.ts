/**
 * Normalized Admin API errors. Pure module (no framework imports) so it can be unit-tested with `node --test`.
 * Errors from `apiRequest` are `ApiError { status, code, message, details }`; anything else is a network or
 * unexpected failure.
 */
export type AdminErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "conflict"
  | "rate_limited"
  | "unavailable"
  | "network"
  | "unknown";

export type AdminFieldError = { path: string; message: string };

export type AdminError = {
  kind: AdminErrorKind;
  status: number | null;
  code: string;
  message: string;
  fieldErrors: AdminFieldError[];
  /** True only for transient failures that are safe to retry automatically for idempotent reads. */
  retryable: boolean;
};

type ApiErrorLike = { status: number; code: string; message: string; details?: unknown };

function isApiErrorLike(error: unknown): error is ApiErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { status?: unknown }).status === "number" &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

function kindForStatus(status: number): AdminErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 400 || status === 422) return "validation";
  if (status === 409) return "conflict";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "unavailable";
  return "unknown";
}

/** Zod issues from the API come back as `details: [{ path: ["body", "reason"], message }]`. */
function fieldErrors(details: unknown): AdminFieldError[] {
  if (!Array.isArray(details)) return [];
  return details.flatMap((issue) => {
    if (typeof issue !== "object" || issue === null) return [];
    const { path, message } = issue as { path?: unknown; message?: unknown };
    if (typeof message !== "string") return [];
    const segments = Array.isArray(path) ? path.filter((part) => part !== "body" && part !== "query" && part !== "params") : [];
    return [{ path: segments.map(String).join("."), message }];
  });
}

const FALLBACK_MESSAGES: Record<AdminErrorKind, string> = {
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You do not have permission to do this.",
  not_found: "This record could not be found.",
  validation: "Please check the highlighted fields.",
  conflict: "This record changed or is in a state that does not allow this action.",
  rate_limited: "Too many requests. Please wait a moment and try again.",
  unavailable: "The service is temporarily unavailable. Please try again.",
  network: "Could not reach the server. Check your connection and try again.",
  unknown: "Something went wrong. Please try again.",
};

export function normalizeAdminError(error: unknown): AdminError {
  if (isApiErrorLike(error)) {
    const kind = kindForStatus(error.status);
    return {
      kind,
      status: error.status,
      code: error.code,
      message: error.message || FALLBACK_MESSAGES[kind],
      fieldErrors: fieldErrors(error.details),
      retryable: kind === "unavailable" && error.code !== "AUDIT_UNAVAILABLE",
    };
  }
  const aborted = typeof error === "object" && error !== null && (error as { name?: unknown }).name === "AbortError";
  if (aborted) {
    return { kind: "network", status: null, code: "ABORTED", message: "The request was cancelled.", fieldErrors: [], retryable: false };
  }
  const isTypeError = error instanceof TypeError;
  return {
    kind: isTypeError ? "network" : "unknown",
    status: null,
    code: isTypeError ? "NETWORK_ERROR" : "UNKNOWN_ERROR",
    message: FALLBACK_MESSAGES[isTypeError ? "network" : "unknown"],
    fieldErrors: [],
    retryable: isTypeError,
  };
}

/** Bounded automatic retry for idempotent reads only. Mutations and sensitive reads never use this. */
export function shouldRetryAdminRead(failureCount: number, error: unknown): boolean {
  return failureCount < 2 && normalizeAdminError(error).retryable;
}
