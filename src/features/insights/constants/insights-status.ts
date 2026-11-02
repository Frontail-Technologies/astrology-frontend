import type { InsightTone } from "../../admin/insights/tones.ts";
import type { ConsultationReportFilters, ConsultationReportMode, ConsultationReportStatus } from "../types/insights-admin.ts";

export const reportTabs = ["overview", "consultations", "commerce", "customers", "content", "operations"] as const;
export type ReportTab = (typeof reportTabs)[number];
export const reportTabLabels: Record<ReportTab, string> = {
  overview: "Overview",
  consultations: "Consultations",
  commerce: "Commerce",
  customers: "Customers",
  content: "Content",
  operations: "Operations",
};

export const consultationModeLabels: Record<ConsultationReportMode, string> = { chat: "Chat", voice: "Voice", video: "Video" };
export const consultationStatusLabels: Record<ConsultationReportStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

/** Consultation/pooja lifecycle keys as the report objects spell them (camelCase `inProgress`). */
export const lifecycleRows = [
  { key: "requested", label: "Requested", tone: "amber" },
  { key: "accepted", label: "Accepted", tone: "blue" },
  { key: "scheduled", label: "Scheduled", tone: "violet" },
  { key: "inProgress", label: "In progress", tone: "teal" },
  { key: "completed", label: "Completed", tone: "green" },
  { key: "cancelled", label: "Cancelled", tone: "neutral" },
  { key: "rejected", label: "Rejected", tone: "red" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const modeRows = [
  { key: "chat", label: "Chat", tone: "blue" },
  { key: "voice", label: "Voice", tone: "green" },
  { key: "video", label: "Video", tone: "violet" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const orderStatusRows = [
  { key: "pending", label: "Pending", tone: "amber" },
  { key: "confirmed", label: "Confirmed", tone: "teal" },
  { key: "processing", label: "Processing", tone: "blue" },
  { key: "shipped", label: "Shipped", tone: "violet" },
  { key: "delivered", label: "Delivered", tone: "green" },
  { key: "cancelled", label: "Cancelled", tone: "neutral" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const earningStatusRows = [
  { key: "pending", label: "Pending", tone: "amber" },
  { key: "available", label: "Available", tone: "green" },
  { key: "held", label: "Held", tone: "red" },
  { key: "paid", label: "Paid", tone: "blue" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const payoutStatusRows = [
  { key: "pending", label: "Pending", tone: "amber" },
  { key: "processing", label: "Processing", tone: "blue" },
  { key: "paid", label: "Paid", tone: "green" },
  { key: "failed", label: "Failed", tone: "red" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const ticketStatusRows = [
  { key: "open", label: "Open", tone: "amber" },
  { key: "inProgress", label: "In progress", tone: "blue" },
  { key: "resolved", label: "Resolved", tone: "green" },
  { key: "closed", label: "Closed", tone: "neutral" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const ticketPriorityRows = [
  { key: "low", label: "Low", tone: "neutral" },
  { key: "normal", label: "Normal", tone: "blue" },
  { key: "high", label: "High", tone: "red" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const reviewStatusRows = [
  { key: "pending", label: "Pending", tone: "amber" },
  { key: "approved", label: "Approved", tone: "green" },
  { key: "rejected", label: "Rejected", tone: "neutral" },
  { key: "reported", label: "Reported", tone: "red" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const customerSegmentRows = [
  { key: "consultationOnly", label: "Consultation only", tone: "violet" },
  { key: "storeOnly", label: "Store only", tone: "orange" },
  { key: "both", label: "Both", tone: "green" },
  { key: "noActivity", label: "No activity", tone: "neutral" },
] as const satisfies readonly { key: string; label: string; tone: InsightTone }[];

export const emptyConsultationFilters: ConsultationReportFilters = { mode: null, status: null, astrologerId: null };

/** Recent activity shown on the dashboard. */
export const RECENT_AUDIT_LIMIT = 8;
