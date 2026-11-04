/** Admin shapes for `/admin/astrologers/:id/documents` (identity documents in private storage). */
export type AstrologerIdType = "aadhaar" | "pan" | "passport" | "voter_id" | "driving_licence";
export type AstrologerDocumentSide = "front" | "back" | "single";
export type AstrologerDocumentStatus = "pending" | "approved" | "rejected";

/** Metadata only: the file is fetched through the audited `/file` endpoint. */
export type AstrologerDocument = {
  id: string;
  astrologerId: string;
  idType: AstrologerIdType;
  side: AstrologerDocumentSide;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: AstrologerDocumentStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedBy: { id: string; email: string | null } | null;
  uploadedBy: { id: string; email: string | null } | null;
  createdAt: string;
  updatedAt: string;
};

export type AstrologerDocumentUpload = { file: File; idType: AstrologerIdType; side: AstrologerDocumentSide };
export type AstrologerDocumentReview = { status: AstrologerDocumentStatus; note?: string | null };
