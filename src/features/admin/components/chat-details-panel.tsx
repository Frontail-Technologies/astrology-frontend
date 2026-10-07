"use client";

import { getInitials } from "../lib/format";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import Link from "next/link";
import { useState } from "react";
import { CalendarClock, Copy, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { astrologers } from "@/features/astrologers/data/astrologers";
import {
  chatStatusLabels,
  chatStatusVariants,
} from "@/features/chats/chat-visuals";
import type { Conversation } from "@/features/chats/types/conversation";
import type { useConsultationRepository } from "@/features/consultations/hooks/use-consultation-repository";
import type { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";

const fullDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border px-4 py-3 last:border-b-0">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      {children}
    </section>
  );
}

function ViewLink({ href, children }: { href: string; children: string }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="h-6 shrink-0 px-2 text-[11px] font-medium"
    >
      <Link href={href}>{children} →</Link>
    </Button>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

export function ChatDetailsPanel({
  conversation,
  customer,
  astrologer,
  consultation,
  addNote,
}: {
  conversation: Conversation;
  customer:
    | ReturnType<typeof useCustomerRepository>["records"][number]
    | undefined;
  astrologer: (typeof astrologers)[number] | undefined;
  consultation:
    | ReturnType<typeof useConsultationRepository>["records"][number]
    | undefined;
  addNote: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  const saveNote = () => {
    if (!note.trim()) return;
    addNote(note.trim());
    setNote("");
    toast.success("Internal note added");
  };

  const { copy } = useCopyToClipboard({ label: "Conversation ID" });
  const copyId = () => copy(conversation.id);

  return (
    <Tabs defaultValue="details" className="h-full min-h-0 gap-0 bg-surface">
      <TabsList variant="line">
        <TabsTrigger value="details">
          Details
        </TabsTrigger>
        <TabsTrigger value="notes">
          Internal Notes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="min-h-0 flex-1 overflow-y-auto">
        <Section label="Customer">
          <div className="flex items-start gap-2.5">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-muted text-[11px] font-semibold text-muted-foreground">
                {getInitials(customer?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-foreground">
                {customer?.name ?? "Unknown customer"}
              </p>
              {customer?.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {customer.email}
                </p>
              )}
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {customer?.phone ?? ""}
                </span>
                {customer?.id && (
                  <ViewLink href={`/admin/customers/${customer.id}`}>
                    View Customer
                  </ViewLink>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section label="Astrologer">
          <div className="flex items-start gap-2.5">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={astrologer?.avatarSrc} alt="" />
              <AvatarFallback className="bg-muted text-[11px] font-semibold text-muted-foreground">
                {getInitials(astrologer?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-foreground">
                {astrologer?.name ?? "Unknown astrologer"}
              </p>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {astrologer?.primaryExpertise ?? ""}
                </span>
                {astrologer?.slug && (
                  <ViewLink href={`/admin/astrologers/${astrologer.slug}`}>
                    View Astrologer
                  </ViewLink>
                )}
              </div>
            </div>
          </div>
        </Section>

        {consultation && (
          <Section label="Consultation">
            <div className="flex items-start gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                <CalendarClock className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">
                  {consultation.id}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {consultation.mode}
                  {consultation.scheduledAt
                    ? ` · ${fullDate(consultation.scheduledAt)}`
                    : ""}
                </p>
                <div className="mt-1.5 flex justify-end">
                  <ViewLink href={`/admin/consultations/${consultation.id}`}>
                    View Consultation
                  </ViewLink>
                </div>
              </div>
            </div>
          </Section>
        )}

        <Section label="Conversation Information">
          <InfoRow label="Conversation ID">
            <span className="inline-flex items-center gap-1">
              {conversation.id}
              <button
                type="button"
                onClick={copyId}
                aria-label="Copy conversation ID"
                className="inline-flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" />
              </button>
            </span>
          </InfoRow>
          <InfoRow label="Mode">{conversation.mode}</InfoRow>
          <InfoRow label="Status">
            <Badge
              variant={chatStatusVariants[conversation.status]}
              className="min-h-5 px-1.5 text-[10px]"
            >
              {chatStatusLabels[conversation.status]}
            </Badge>
          </InfoRow>
          <InfoRow label="Started At">{fullDate(conversation.startedAt)}</InfoRow>
          {conversation.flagReason && (
            <InfoRow label="Flag reason">{conversation.flagReason}</InfoRow>
          )}
        </Section>
      </TabsContent>

      <TabsContent
        value="notes"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {conversation.internalNotes.length > 0 ? (
            conversation.internalNotes.map((entry) => (
              <div
                key={entry.id}
                className="rounded-md border border-warning/25 bg-warning/10 p-2.5"
              >
                <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <StickyNote className="size-3" aria-hidden="true" />
                  <span className="font-semibold text-foreground">
                    {entry.author}
                  </span>
                  <span>· {fullDate(entry.createdAt)}</span>
                </div>
                <p className="text-xs leading-5 text-foreground">
                  {entry.content}
                </p>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No internal notes yet.
            </p>
          )}
        </div>
        <div className="shrink-0 space-y-2 border-t border-border p-3">
          <label
            htmlFor="internal-note"
            className="text-xs font-medium text-muted-foreground"
          >
            Add internal note
          </label>
          <Textarea
            id="internal-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Visible only to admins…"
            className="min-h-16 resize-none text-xs"
          />
          <Button
            size="sm"
            variant="conversion"
            onClick={saveNote}
            disabled={!note.trim()}
            className="h-8 w-full text-xs"
          >
            Add note
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
