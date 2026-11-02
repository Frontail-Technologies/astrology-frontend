"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ADMIN_REASON } from "@/features/admin/data/admin-reason";
import { TRANSCRIPT_PAGE_SIZE, chatSenderLabel, chatStatusLabels, chatStatusVariants } from "@/features/chats/constants/chat-status";
import { personPrimaryLabel } from "@/features/customers/lib/customer-display";
import { useChatDetail, useChatTranscriptAccess } from "@/features/chats/hooks/use-chat-admin";
import type { TranscriptAccessInput, TranscriptMessage } from "@/features/chats/types/chat-admin";
import { consultationStatusLabels } from "@/features/consultations/constants/consultation-status";
import type { AdminPage } from "@/features/admin/data/admin-list-state";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { formatDateTime } from "../../lib/format";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { ChatFlaggedBadge } from "./admin-chats-view";
import { ChatFlagPanel } from "./chat-flag-panel";

/**
 * Chat metadata plus reason-gated transcript access. The transcript lives only in this component's state (never in
 * the query cache), is cleared on unmount, and every page is a new explicit, audited request — never retried.
 */
export function AdminChatDetailView({ id }: { id: string }) {
  const detail = useChatDetail(id);
  const transcript = useChatTranscriptAccess(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [request, setRequest] = useState<TranscriptAccessInput | null>(null);
  const [result, setResult] = useState<AdminPage<TranscriptMessage> | null>(null);

  const load = (input: TranscriptAccessInput, onDone?: () => void) => {
    transcript.mutate(input, {
      onSuccess: (page) => {
        setRequest(input);
        setResult(page);
        onDone?.();
      },
    });
  };

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="chat">
      {() => {
        const chat = detail.data!;
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`Chat with ${chat.astrologer.displayName}`}
              backHref="/admin/chats"
              backLabel="Chats"
              meta={
                <>
                  <AdminStatusBadge status={chat.status} labels={chatStatusLabels} variants={chatStatusVariants} />
                  <ChatFlaggedBadge chat={chat} />
                  <span>{personPrimaryLabel(chat.customer)}</span>
                  <span className="tabular-nums">Started {formatDateTime(chat.createdAt)}</span>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <AdminSectionCard title="Private transcript">
                {!result ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground"><Lock className="size-[18px]" aria-hidden="true" /></span>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Messages are private between the customer and astrologer. Viewing them requires a reason and every access is recorded in the audit log.
                    </p>
                    <Button variant="outline" size="sm" className="bg-surface" onClick={() => setDialogOpen(true)}>
                      <ShieldAlert aria-hidden="true" />
                      View private transcript
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                      Audited access · reason: “{request?.reason}”. This transcript is cleared when you leave the page.
                    </p>
                    {result.items.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">No messages on this page.</p>
                    ) : (
                      <ol className="space-y-2">
                        {result.items.map((message) => (
                          <li key={message.id} className="rounded-md border border-border p-3">
                            <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{chatSenderLabel(message.senderRole)}</span>
                              <time className="tabular-nums" dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time>
                            </div>
                            <p className="whitespace-pre-line wrap-break-word text-sm">{message.body}</p>
                          </li>
                        ))}
                      </ol>
                    )}
                    {transcript.error ? (
                      <p role="alert" className="text-sm text-destructive">{transcript.error.message}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                      <span>
                        Page {result.page} of {Math.max(result.totalPages, 1)} · {result.total} messages
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={transcript.isPending || result.page <= 1 || !request}
                          onClick={() => request && load({ ...request, page: result.page - 1 })}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={transcript.isPending || result.page >= result.totalPages || !request}
                          onClick={() => request && load({ ...request, page: result.page + 1 })}
                        >
                          Next
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setResult(null);
                            setRequest(null);
                            transcript.reset();
                          }}
                        >
                          Hide transcript
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </AdminSectionCard>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Details">
                  <div className="divide-y divide-border">
                    <DetailRow label="Customer" value={<Link className="break-all hover:underline" href={`/admin/customers/${chat.customer.id}`}>{personPrimaryLabel(chat.customer)}</Link>} />
                    <DetailRow label="Astrologer" value={<Link className="hover:underline" href={`/admin/astrologers/${chat.astrologer.id}`}>{chat.astrologer.displayName}</Link>} />
                    <DetailRow label="Consultation" value={<Link className="hover:underline" href={`/admin/consultations/${chat.consultationId}`}>{consultationStatusLabels[chat.consultationStatus]}</Link>} />
                    <DetailRow label="Started" value={<span className="tabular-nums">{formatDateTime(chat.createdAt)}</span>} />
                    <DetailRow label="Last message" value={chat.lastMessage ? <span className="tabular-nums">{formatDateTime(chat.lastMessage.createdAt)} · {chatSenderLabel(chat.lastMessage.senderRole)}</span> : "No messages yet"} />
                    <DetailRow label="Unread" value={<span className="tabular-nums">{chat.unreadCount}</span>} />
                  </div>
                </AdminSectionCard>
                <ChatFlagPanel chat={chat} />
              </AdminDetailStickyRail>
            </div>

            <AdminConfirmDialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) transcript.reset();
              }}
              title="View private transcript?"
              description="This discloses private messages. Your reason and identity are recorded in the audit log before anything is shown. If the audit log is unavailable, nothing is disclosed."
              confirmLabel="Record reason and view"
              destructive
              reason={ADMIN_REASON}
              pending={transcript.isPending}
              error={transcript.error}
              onConfirm={(reason) => {
                if (reason) load({ reason, page: 1, limit: TRANSCRIPT_PAGE_SIZE, order: "asc" }, () => setDialogOpen(false));
              }}
            />
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
