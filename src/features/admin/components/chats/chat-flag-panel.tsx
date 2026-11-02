"use client";

import { useState } from "react";
import { Flag, FlagOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ADMIN_REASON } from "@/features/admin/data/admin-reason";
import { CHAT_FLAG_ERROR_HINTS, CHAT_UNFLAG_REASON_MAX } from "@/features/chats/constants/chat-status";
import { useFlagChat, useUnflagChat } from "@/features/chats/hooks/use-chat-admin";
import type { AdminConversation } from "@/features/chats/types/chat-admin";
import { formatDateTime } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminSectionCard } from "../shared/admin-section-card";
import { useConfirmAction } from "../shared/use-confirm-action";

/**
 * Moderation flag for a chat (metadata only — flagging never discloses or loads messages). Flagging needs an audited
 * reason (10–500); removing a flag takes an optional reason. Conflicts (`CHAT_ALREADY_FLAGGED`, `CHAT_NOT_FLAGGED`)
 * render inline in the dialog.
 */
export function ChatFlagPanel({ chat }: { chat: AdminConversation }) {
  const flag = useFlagChat(chat.id);
  const unflag = useUnflagChat(chat.id);
  const flagConfirm = useConfirmAction<true>(flag);
  const unflagConfirm = useConfirmAction<true>(unflag);
  const [unflagReason, setUnflagReason] = useState("");
  const flagHint = flag.error?.code ? CHAT_FLAG_ERROR_HINTS[flag.error.code] : undefined;
  const unflagHint = unflag.error?.code ? CHAT_FLAG_ERROR_HINTS[unflag.error.code] : undefined;
  const flagged = Boolean(chat.flaggedAt);

  return (
    <AdminSectionCard title="Moderation">
      {flagged ? (
        <div className="space-y-3">
          <div className="divide-y divide-border">
            <DetailRow label="Flagged" value={chat.flaggedAt ? <span className="tabular-nums">{formatDateTime(chat.flaggedAt)}</span> : "Unknown"} />
            <DetailRow label="Flagged by" value={<span className="break-all">{chat.flaggedBy?.email ?? "Unknown admin"}</span>} />
          </div>
          {chat.flagReason ? (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Reason</p>
              <p className="whitespace-pre-line wrap-break-word text-sm">{chat.flagReason}</p>
            </div>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-surface"
            onClick={() => {
              setUnflagReason("");
              unflagConfirm.open(true);
            }}
          >
            <FlagOff aria-hidden="true" />
            Remove flag
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Flag this chat for follow-up, for example after a complaint. Flagging does not open the transcript.</p>
          <Button size="sm" variant="outline" className="w-full bg-surface" onClick={() => flagConfirm.open(true)}>
            <Flag aria-hidden="true" />
            Flag chat
          </Button>
        </div>
      )}

      <AdminConfirmDialog
        {...flagConfirm.dialogProps}
        title="Flag this chat?"
        description="The chat is marked for moderation follow-up. The flag and your reason are recorded in the audit log."
        confirmLabel="Flag chat"
        destructive
        reason={{ ...ADMIN_REASON, placeholder: "For example: Customer complaint in ticket ST-1042 about abusive language" }}
        onConfirm={(reason) => {
          if (reason) flag.mutate({ reason }, { onSuccess: flagConfirm.close });
        }}
      >
        {flagHint ? <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">{flagHint}</p> : null}
      </AdminConfirmDialog>

      <AdminConfirmDialog
        {...unflagConfirm.dialogProps}
        title="Remove the flag?"
        description="The chat is no longer marked for moderation. This is recorded in the audit log."
        confirmLabel="Remove flag"
        onConfirm={() => {
          const reason = unflagReason.trim();
          unflag.mutate(reason ? { reason } : {}, { onSuccess: unflagConfirm.close });
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="unflag-reason">
            Reason <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="unflag-reason"
            value={unflagReason}
            onChange={(event) => setUnflagReason(event.target.value)}
            maxLength={CHAT_UNFLAG_REASON_MAX}
            disabled={unflag.isPending}
            placeholder="For example: Reviewed, no policy violation"
          />
          <p className="text-xs text-muted-foreground">
            {unflagReason.trim().length}/{CHAT_UNFLAG_REASON_MAX}
          </p>
        </div>
        {unflagHint ? <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">{unflagHint}</p> : null}
      </AdminConfirmDialog>
    </AdminSectionCard>
  );
}
