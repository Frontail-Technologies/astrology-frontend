import type { AdminReasonRequirement } from "@/features/admin/components/shared/admin-confirm-dialog";

/** Reason limits mirror the backend (trimmed, 10–500 characters); the backend enforces them regardless. */
export const ADMIN_REASON: AdminReasonRequirement = {
  label: "Reason",
  minLength: 10,
  maxLength: 500,
  placeholder: "For example: Support ticket ST-1042, customer dispute about a session",
};
