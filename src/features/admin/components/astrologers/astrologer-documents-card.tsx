"use client";

import { useEffect, useId, useState } from "react";
import { BadgeCheck, Eye, FileText, ShieldCheck, Trash2, Upload, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeAdminError } from "@/features/admin/data/admin-errors";
import {
  ASTROLOGER_DOCUMENT_ACCEPT,
  astrologerDocumentSideLabels,
  astrologerDocumentStatusLabels,
  astrologerDocumentStatusVariants,
  astrologerIdTypeLabels,
  documentFileProblem,
  formatFileSize,
} from "@/features/astrologers/constants/astrologer-documents";
import {
  fetchAstrologerDocumentFile,
  useAstrologerDocuments,
  useDeleteAstrologerDocument,
  useReviewAstrologerDocument,
  useUploadAstrologerDocument,
} from "@/features/astrologers/hooks/use-astrologer-admin";
import type { AstrologerDocument, AstrologerDocumentSide, AstrologerIdType } from "@/features/astrologers/types/astrologer-document-admin";
import { formatDateOnly } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminStatusBadge } from "../shared/admin-status-badge";

const docLabel = (document: AstrologerDocument) =>
  `${astrologerIdTypeLabels[document.idType]}${document.side === "single" ? "" : ` · ${astrologerDocumentSideLabels[document.side]}`}`;

type Review = { document: AstrologerDocument; status: "approved" | "rejected" } | null;

/** Identity documents kept in private storage. Only admins can open them, and every view is audited. */
export function AstrologerDocumentsCard({ astrologerId }: { astrologerId: string }) {
  const documents = useAstrologerDocuments(astrologerId);
  const upload = useUploadAstrologerDocument(astrologerId);
  const review = useReviewAstrologerDocument(astrologerId);
  const remove = useDeleteAstrologerDocument(astrologerId);
  const [uploading, setUploading] = useState(false);
  const [idType, setIdType] = useState<AstrologerIdType | "">("");
  const [side, setSide] = useState<AstrologerDocumentSide>("single");
  const [file, setFile] = useState<File | null>(null);
  const [reviewing, setReviewing] = useState<Review>(null);
  const [note, setNote] = useState("");
  const [deleting, setDeleting] = useState<AstrologerDocument | null>(null);
  const [viewing, setViewing] = useState<AstrologerDocument | null>(null);
  const ids = { type: useId(), side: useId(), file: useId(), note: useId() };
  const items = documents.data ?? [];
  const fileProblem = file ? documentFileProblem(file) : null;

  const startUpload = () => {
    upload.reset();
    setIdType("");
    setSide("single");
    setFile(null);
    setUploading(true);
  };
  const startReview = (document: AstrologerDocument, status: "approved" | "rejected") => {
    review.reset();
    setNote("");
    setReviewing({ document, status });
  };

  return (
    <AdminSectionCard
      title="ID documents"
      description="Private: only admins can open these files, and every view is recorded in the audit log."
      flush
      actions={
        <Button variant="outline" size="sm" className="bg-surface" onClick={startUpload}>
          <Upload aria-hidden="true" />
          Upload
        </Button>
      }
    >
      {documents.error ? (
        <div className="px-5 py-4">
          <AdminErrorState error={documents.error} onRetry={documents.reload} title="Could not load documents" />
        </div>
      ) : !documents.ready ? (
        <p className="px-5 py-4 text-sm text-muted-foreground">Loading documents…</p>
      ) : items.length === 0 ? (
        <div className="flex items-start gap-3 px-5 py-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No ID documents yet. Upload an Aadhaar, PAN, passport, voter ID or driving licence before verifying this astrologer.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((document) => (
            <li key={document.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 px-5 py-3">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground/65">
                <FileText className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {docLabel(document)}
                  <AdminStatusBadge status={document.status} labels={astrologerDocumentStatusLabels} variants={astrologerDocumentStatusVariants} />
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {document.originalName} · {formatFileSize(document.sizeBytes)} · Uploaded {formatDateOnly(document.createdAt)}
                </p>
                {document.reviewNote ? <p className="mt-1 text-xs text-destructive">{document.reviewNote}</p> : null}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="bg-surface" onClick={() => setViewing(document)}>
                  <Eye aria-hidden="true" />
                  View
                </Button>
                <AdminRowActions
                  label={`Actions for ${docLabel(document)}`}
                  actions={[
                    ...(document.status !== "approved" ? [{ label: "Approve", icon: BadgeCheck, onSelect: () => startReview(document, "approved") }] : []),
                    ...(document.status !== "rejected" ? [{ label: "Reject", icon: XCircle, onSelect: () => startReview(document, "rejected") }] : []),
                    {
                      label: "Delete",
                      icon: Trash2,
                      destructive: true,
                      separatorBefore: true,
                      onSelect: () => {
                        remove.reset();
                        setDeleting(document);
                      },
                    },
                  ]}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminConfirmDialog
        open={uploading}
        onOpenChange={setUploading}
        title="Upload ID document"
        description="PDF, JPEG, PNG or WebP, up to 10 MB. Upload front and back separately when the card has two sides."
        confirmLabel="Upload"
        pending={upload.isPending}
        error={upload.error}
        confirmDisabled={!idType || !file || Boolean(fileProblem)}
        onConfirm={() => idType && file && upload.mutate({ idType, side, file }, { onSuccess: () => setUploading(false) })}
      >
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor={ids.type}>Document</Label>
              <AdminSelectField control={{ id: ids.type }} value={idType} onValueChange={(value) => setIdType((value ?? "") as AstrologerIdType | "")} options={astrologerIdTypeLabels} placeholder="Choose a document" disabled={upload.isPending} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={ids.side}>Side</Label>
              <AdminSelectField control={{ id: ids.side }} value={side} onValueChange={(value) => value && setSide(value as AstrologerDocumentSide)} options={astrologerDocumentSideLabels} disabled={upload.isPending} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={ids.file}>File</Label>
            <Input id={ids.file} type="file" accept={ASTROLOGER_DOCUMENT_ACCEPT} onChange={(event) => setFile(event.target.files?.[0] ?? null)} disabled={upload.isPending} />
            {fileProblem ? <p className="text-xs text-destructive">{fileProblem}</p> : null}
          </div>
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={reviewing !== null}
        onOpenChange={(next) => (next ? null : setReviewing(null))}
        title={reviewing?.status === "approved" ? `Approve ${reviewing ? docLabel(reviewing.document) : ""}?` : `Reject ${reviewing ? docLabel(reviewing.document) : ""}?`}
        description={reviewing?.status === "approved" ? "Confirms the document is genuine and matches the astrologer." : "The document stays on file, marked as rejected, with your reason."}
        confirmLabel={reviewing?.status === "approved" ? "Approve" : "Reject"}
        destructive={reviewing?.status === "rejected"}
        pending={review.isPending}
        error={review.error}
        confirmDisabled={reviewing?.status === "rejected" && note.trim() === ""}
        onConfirm={() =>
          reviewing &&
          review.mutate({ documentId: reviewing.document.id, input: { status: reviewing.status, note: note.trim() || null } }, { onSuccess: () => setReviewing(null) })
        }
      >
        <div className="grid gap-1.5">
          <Label htmlFor={ids.note}>
            {reviewing?.status === "rejected" ? "Reason" : "Note"} {reviewing?.status === "rejected" ? <span className="text-destructive">*</span> : <span className="font-normal text-muted-foreground">(optional)</span>}
          </Label>
          <Textarea id={ids.note} value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} placeholder={reviewing?.status === "rejected" ? "For example: the photo is blurred, upload a clearer scan." : undefined} disabled={review.isPending} />
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={deleting !== null}
        onOpenChange={(next) => (next ? null : setDeleting(null))}
        title={`Delete ${deleting ? docLabel(deleting) : "document"}?`}
        description="The file is removed from storage. The audit log keeps a record that it existed."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        error={remove.error}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />

      <DocumentViewer key={viewing?.id ?? "closed"} astrologerId={astrologerId} document={viewing} onClose={() => setViewing(null)} />
    </AdminSectionCard>
  );
}

/** Fetches the private file into a temporary object URL (revoked on close) and shows it inline. Remounted per document (`key`). */
function DocumentViewer({ astrologerId, document, onClose }: { astrologerId: string; document: AstrologerDocument | null; onClose: () => void }) {
  const [state, setState] = useState<{ url: string | null; error: string | null; loading: boolean }>({ url: null, error: null, loading: document !== null });
  const documentId = document?.id ?? null;

  useEffect(() => {
    if (!documentId) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    fetchAstrologerDocumentFile(astrologerId, documentId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ url: null, error: normalizeAdminError(error).message, loading: false });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [astrologerId, documentId]);

  const isPdf = document?.mimeType === "application/pdf";
  return (
    <Dialog open={document !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[92svh] w-[min(56rem,calc(100vw-2rem))] max-w-none gap-3 overflow-hidden sm:max-w-none">
        <DialogHeader>
          <DialogTitle>{document ? docLabel(document) : "Document"}</DialogTitle>
          <DialogDescription>{document ? `${document.originalName} · this view is recorded in the audit log.` : ""}</DialogDescription>
        </DialogHeader>
        <div className="grid min-h-64 place-items-center overflow-auto rounded-lg border border-border bg-muted/40">
          {state.loading ? (
            <p className="p-6 text-sm text-muted-foreground">Opening document…</p>
          ) : state.error ? (
            <p className="p-6 text-sm text-destructive">{state.error}</p>
          ) : state.url ? (
            isPdf ? (
              <iframe src={state.url} title={document ? docLabel(document) : "Document"} className="h-[70svh] w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- a private blob: URL; next/image cannot optimise it
              <img src={state.url} alt={document ? docLabel(document) : "Document"} className="max-h-[70svh] w-auto object-contain" />
            )
          ) : null}
        </div>
        {state.url && document ? (
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm" className="bg-surface">
              <a href={state.url} download={document.originalName}>
                Download
              </a>
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
