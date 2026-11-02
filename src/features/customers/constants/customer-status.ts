import type { CustomerAccountStatus } from "../types/customer.ts";

export const customerStatuses = ["active", "suspended", "archived"] as const satisfies readonly CustomerAccountStatus[];

export const customerStatusLabels: Record<CustomerAccountStatus, string> = { active: "Active", suspended: "Suspended", archived: "Archived" };
export const customerStatusVariants: Record<CustomerAccountStatus, "online" | "unavailable" | "muted"> = { active: "online", suspended: "unavailable", archived: "muted" };
