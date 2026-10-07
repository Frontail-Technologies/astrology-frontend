"use client";

import { getInitials } from "../lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Flag,
  Info,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  PanelRight,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { astrologers } from "@/features/astrologers/data/astrologers";
import {
  chatModeVisuals,
  chatStatusLabels,
  chatStatusVariants,
} from "@/features/chats/chat-visuals";
import { useConversationRepository } from "@/features/chats/hooks/use-conversation-repository";
import type {
  Conversation,
  ConversationMessage,
  ConversationSenderType,
} from "@/features/chats/types/conversation";
import { useConsultationRepository } from "@/features/consultations/hooks/use-consultation-repository";
import { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";
import { ChatConversationList } from "./chat-conversation-list";
import { ChatDetailsPanel } from "./chat-details-panel";

const timeStr = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const dateStr = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

type MsgGroup = {
  senderType: ConversationSenderType;
  senderId?: string;
  messages: ConversationMessage[];
};
type DateGroup = { date: string; groups: MsgGroup[] };

function groupByDateAndSender(messages: ConversationMessage[]): DateGroup[] {
  const dateGroups: DateGroup[] = [];
  for (const msg of messages) {
    const date = dateStr(msg.createdAt);
    let dg = dateGroups.find((g) => g.date === date);
    if (!dg) {
      dg = { date, groups: [] };
      dateGroups.push(dg);
    }
    const last = dg.groups.at(-1);
    if (
      last &&
      last.senderType === msg.senderType &&
      last.senderId === msg.senderId &&
      msg.senderType !== "system"
    ) {
      last.messages.push(msg);
    } else {
      dg.groups.push({
        senderType: msg.senderType,
        senderId: msg.senderId,
        messages: [msg],
      });
    }
  }
  return dateGroups;
}

function ModeBadge({ mode }: { mode: Conversation["mode"] }) {
  const visual = chatModeVisuals[mode];
  const Icon = visual.icon;
  return (
    <Badge
      variant="outline"
      className={`min-h-5 shrink-0 gap-1 whitespace-nowrap rounded-md px-1.5 py-0 text-[11px] font-medium ${visual.className}`}
    >
      <Icon className="size-2.5" aria-hidden="true" />
      {mode}
    </Badge>
  );
}

function AttachmentRow({
  attachment,
}: {
  attachment: NonNullable<ConversationMessage["attachment"]>;
}) {
  return (
    <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border bg-background/80 px-2 py-1">
      <Paperclip
        className="size-3 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="min-w-0 truncate text-xs text-foreground">
        {attachment.name}
      </span>
      {attachment.type === "image" && attachment.url && (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="ml-auto size-8 rounded object-cover"
        />
      )}
    </div>
  );
}

export function AdminChatDetailView({ id }: { id: string }) {
  const repository = useConversationRepository();
  const {
    records: customers,
    ready: customersReady,
    getById: getCustomer,
  } = useCustomerRepository();
  const consultations = useConsultationRepository();
  const [closeOpen, setCloseOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [reason, setReason] =
    useState<NonNullable<Conversation["flagReason"]>>("Privacy concern");
  const [listSearch, setListSearch] = useState("");

  useEffect(() => {
    if (repository.ready) {
      const current = repository.getById(id);
      if (current?.unreadCount) repository.markRead(current);
    }
  }, [id, repository]);

  if (!repository.ready || !customersReady || !consultations.ready)
    return null;

  const conversation = repository.getById(id);
  if (!conversation) notFound();

  const customer = getCustomer(conversation.customerId) ?? undefined;
  const astrologer = astrologers.find((a) => a.id === conversation.astrologerId);
  const consultation = conversation.consultationId
    ? (consultations.getById(conversation.consultationId) ?? undefined)
    : undefined;
  const dateGroups = groupByDateAndSender(conversation.messages);

  const list = (
    <ChatConversationList
      currentId={id}
      records={repository.records}
      customers={customers}
      search={listSearch}
      onSearchChange={setListSearch}
    />
  );
  const details = (
    <ChatDetailsPanel
      conversation={conversation}
      customer={customer}
      astrologer={astrologer}
      consultation={consultation}
      addNote={(note) => repository.addInternalNote(conversation, note)}
    />
  );

  const closeOrReopen = () => {
    if (conversation.status === "closed") {
      repository.reopen(conversation);
      toast.success("Conversation reopened");
    } else {
      setCloseOpen(true);
    }
  };

  const moreMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="size-8 p-0"
          aria-label="More actions"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => repository.markRead(conversation)}>
          Mark as read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <section className="flex h-[calc(100svh-2.5rem-3.5rem)] min-h-[32rem] lg:h-[calc(100svh-2.5rem)] flex-col overflow-hidden rounded-md border border-border bg-surface">
      <header className="shrink-0 border-b border-border px-3 py-1.5 md:px-4">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between md:gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 md:flex-1">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-1.5 h-8 shrink-0 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Link href="/admin/chats" aria-label="Back to Chats">
                <ArrowLeft className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Chats</span>
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 shrink-0 p-0 xl:hidden"
                  aria-label="Open conversation list"
                >
                  <MessageSquare className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Conversations</SheetTitle>
                </SheetHeader>
                {list}
              </SheetContent>
            </Sheet>

            <h1 className="shrink-0 whitespace-nowrap font-sans text-base font-semibold leading-6 tracking-tight text-foreground">
              {conversation.id}
            </h1>

            <div className="ml-auto md:hidden">{moreMenu}</div>

            <div className="flex basis-full items-center gap-1.5 md:basis-auto">
              <Badge
                variant={chatStatusVariants[conversation.status]}
                className="min-h-5 shrink-0 whitespace-nowrap px-1.5 py-0 text-[11px] leading-5"
              >
                {chatStatusLabels[conversation.status]}
              </Badge>
              <ModeBadge mode={conversation.mode} />
            </div>

            <p className="basis-full truncate text-xs leading-4 text-muted-foreground">
              <span className="font-medium text-foreground">
                {customer?.name ?? conversation.customerId}
              </span>{" "}
              ↔{" "}
              <span className="font-medium text-foreground">
                {astrologer?.name ?? conversation.astrologerId}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 md:shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs lg:hidden"
                >
                  <PanelRight className="size-3.5" aria-hidden="true" />
                  Details
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Conversation details</SheetTitle>
                </SheetHeader>
                {details}
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => {
                if (conversation.status === "flagged") {
                  repository.unflag(conversation);
                  toast.success("Conversation unflagged");
                } else {
                  setFlagOpen(true);
                }
              }}
            >
              <Flag className="size-3.5" aria-hidden="true" />
              {conversation.status === "flagged" ? "Unflag" : "Flag"}
            </Button>
            <Button
              variant={
                conversation.status === "closed" ? "outline" : "conversion"
              }
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={closeOrReopen}
              title={
                conversation.status === "closed"
                  ? "Reopen conversation"
                  : "Close conversation"
              }
            >
              {conversation.status === "closed" ? (
                <RotateCcw className="size-3.5" aria-hidden="true" />
              ) : (
                <X className="size-3.5" aria-hidden="true" />
              )}
              {conversation.status === "closed" ? "Reopen" : "Close"}
            </Button>
            <div className="hidden md:block">{moreMenu}</div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 divide-x divide-border overflow-hidden">
        <div className="hidden w-[260px] shrink-0 xl:block">{list}</div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            aria-label="Conversation message thread"
            className="min-h-0 flex-1 overflow-y-auto px-5 py-3"
          >
            {dateGroups.map((dg) => (
              <div key={dg.date}>
                <div className="mx-auto my-2 flex max-w-md items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[11px] text-muted-foreground">
                    {dg.date}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {dg.groups.map((group, gi) => {
                  if (group.senderType === "system") {
                    return (
                      <p
                        key={group.messages[0].id}
                        className="my-1.5 text-center text-xs text-muted-foreground"
                      >
                        {group.messages[0].content}
                      </p>
                    );
                  }

                  const isAstrologer = group.senderType === "astrologer";
                  const senderName = isAstrologer
                    ? astrologer?.name
                    : customer?.name;
                  const first = group.messages[0];

                  return (
                    <div
                      key={`${first.id}-${gi}`}
                      className={`mb-3 flex items-start gap-2.5 ${
                        isAstrologer ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="size-8 shrink-0">
                        {isAstrologer && (
                          <AvatarImage src={astrologer?.avatarSrc} alt="" />
                        )}
                        <AvatarFallback
                          className={`text-[11px] font-semibold ${
                            isAstrologer
                              ? "bg-primary/15 text-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getInitials(senderName)}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`flex min-w-0 max-w-[60%] flex-col gap-1 ${
                          isAstrologer ? "items-end" : "items-start"
                        }`}
                      >
                        <p className="flex items-baseline gap-1.5 text-xs leading-4">
                          <span className="font-semibold text-foreground">
                            {senderName ?? group.senderType}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {timeStr(first.createdAt)}
                          </span>
                        </p>
                        {group.messages.map((msg, mi) => (
                          <div
                            key={msg.id}
                            className={`w-fit max-w-full rounded-lg px-3 py-2 text-[13px] leading-5 text-foreground ${
                              isAstrologer
                                ? "bg-primary/12 ring-1 ring-primary/15"
                                : "bg-muted"
                            }`}
                          >
                            <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                              {msg.content}
                            </p>
                            {msg.attachment && (
                              <AttachmentRow attachment={msg.attachment} />
                            )}
                            {mi > 0 && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {timeStr(msg.createdAt)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="shrink-0 border-t border-border px-4 py-2">
            <p className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5 shrink-0" aria-hidden="true" />
              Admin cannot send messages in this conversation. Use Internal
              Notes for moderation notes.
            </p>
          </div>
        </div>

        <div className="hidden w-[272px] shrink-0 lg:block">{details}</div>
      </div>

      <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the conversation as closed for moderation review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                repository.close(conversation);
                setCloseOpen(false);
                toast.success("Conversation closed");
              }}
            >
              Close conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={flagOpen} onOpenChange={setFlagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag conversation</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Reason</Label>
            <Select
              value={reason}
              onValueChange={(v) =>
                setReason(v as NonNullable<Conversation["flagReason"]>)
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "Abuse",
                    "Spam",
                    "Privacy concern",
                    "Payment dispute",
                    "Other",
                  ] as const
                ).map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                repository.flag(conversation, reason);
                setFlagOpen(false);
                toast.success("Conversation flagged");
              }}
            >
              Flag conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
