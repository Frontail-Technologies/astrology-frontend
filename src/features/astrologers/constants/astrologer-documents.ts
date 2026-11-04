import type { AstrologerDocumentSide, AstrologerDocumentStatus, AstrologerIdType } from "../types/astrologer-document-admin.ts";

export const astrologerIdTypeLabels: Record<AstrologerIdType, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN card",
  passport: "Passport",
  voter_id: "Voter ID",
  driving_licence: "Driving licence",
};

export const astrologerDocumentSideLabels: Record<AstrologerDocumentSide, string> = { single: "Single page", front: "Front", back: "Back" };

export const astrologerDocumentStatusLabels: Record<AstrologerDocumentStatus, string> = { pending: "Pending review", approved: "Approved", rejected: "Rejected" };
export const astrologerDocumentStatusVariants: Record<AstrologerDocumentStatus, "pending" | "verified" | "unavailable"> = { pending: "pending", approved: "verified", rejected: "unavailable" };

/** Matches the server (`MAX_DOCUMENT_UPLOAD_BYTES`, default 10 MB) and its accepted formats. */
export const ASTROLOGER_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const ASTROLOGER_DOCUMENT_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";
const acceptedTypes = new Set(ASTROLOGER_DOCUMENT_ACCEPT.split(","));

/** Client-side check before upload; the server re-checks the real file type from its contents. */
export function documentFileProblem(file: Pick<File, "type" | "size"> | null): string | null {
  if (!file) return "Choose a file.";
  if (!acceptedTypes.has(file.type)) return "Upload a PDF, JPEG, PNG or WebP file.";
  if (file.size > ASTROLOGER_DOCUMENT_MAX_BYTES) return "The file is larger than 10 MB.";
  return null;
}

export const formatFileSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);
