import type { EarningStatus } from "../types/earning-admin.ts";

export const earningStatusLabels: Record<EarningStatus, string> = { pending: "Pending", available: "Available", held: "Held", paid: "Paid", reversed: "Reversed" };
export const earningStatusVariants: Record<EarningStatus, "pending" | "online" | "verified" | "unavailable" | "muted"> = { pending: "pending", available: "online", held: "muted", paid: "verified", reversed: "unavailable" };
