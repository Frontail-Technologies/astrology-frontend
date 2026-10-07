"use client";

import { getInitials } from "../lib/format";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Copy, Eye, MessageCircle, Search } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { astrologers } from "@/features/astrologers/data/astrologers";
import type { ConsultationMode } from "@/features/astrologers/types/astrologer";
import {
  chatModeVisuals,
  chatStatusLabels,
  chatStatusVariants,
} from "@/features/chats/chat-visuals";
import { useConversationRepository } from "@/features/chats/hooks/use-conversation-repository";
import type { Conversation } from "@/features/chats/types/conversation";
import { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";
import {
  AdminDataTable,
  AdminDataTableColumnVisibility,
} from "./shared/admin-data-table";
import { AdminDataTableColumnHeader } from "./shared/admin-data-table-column-header";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function ModeBadge({ mode }: { mode: ConsultationMode }) {
  const visual = chatModeVisuals[mode];
  const Icon = visual.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${visual.className}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {mode}
    </Badge>
  );
}

type TabValue = "all" | "open" | "unread" | "flagged" | "closed";

export function AdminChatsView() {
  const { records } = useConversationRepository();
  const { records: customers } = useCustomerRepository();
  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"all" | ConsultationMode>("all");
  const [astrologerId, setAstrologerId] = useState("all");

  const tabCount = (value: TabValue) => {
    if (value === "all") return records.length;
    if (value === "unread") return records.filter((r) => r.unreadCount > 0).length;
    return records.filter((r) => r.status === value).length;
  };

  const filtered = useMemo(
    () =>
      records.filter((conversation) => {
        const customer = customers.find((c) => c.id === conversation.customerId);
        const astrologer = astrologers.find((a) => a.id === conversation.astrologerId);
        const matchesTab =
          tab === "all" ||
          (tab === "unread"
            ? conversation.unreadCount > 0
            : conversation.status === tab);
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          [
            conversation.id,
            customer?.name,
            astrologer?.name,
            conversation.lastMessagePreview,
          ].some((v) => v?.toLowerCase().includes(query));
        return (
          matchesTab &&
          (mode === "all" || conversation.mode === mode) &&
          (astrologerId === "all" || conversation.astrologerId === astrologerId) &&
          matchesSearch
        );
      }),
    [astrologerId, customers, mode, records, search, tab],
  );
  const { copied, copy: copyId } = useCopyToClipboard({ label: "Conversation ID" });

  const columns = useMemo<ColumnDef<Conversation>[]>(
    () => [
      {
        id: "conversation",
        accessorFn: (row) => row.id,
        header: ({ column }) => (
          <AdminDataTableColumnHeader column={column} label="Conversation" />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold tracking-tight">{row.original.id}</span>
              <Button
                variant="ghost"
                size="sm"
                className="size-6 rounded-md p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => void copyId(row.original.id)}
                aria-label={`Copy ${row.original.id}`}
              >
                {copied === row.original.id ? (
                  <Check className="size-3.5 text-success" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Started {formatDate(row.original.startedAt)}
            </p>
          </div>
        ),
      },
      {
        id: "customer",
        accessorFn: (row) =>
          customers.find((c) => c.id === row.customerId)?.name ?? "",
        header: ({ column }) => (
          <AdminDataTableColumnHeader column={column} label="Customer" />
        ),
        cell: ({ row }) => {
          const customer = customers.find((c) => c.id === row.original.customerId);
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(customer?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 max-w-36">
                <p className="truncate font-medium">
                  {customer?.name ?? "Unknown customer"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {customer?.email ?? ""}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "astrologer",
        accessorFn: (row) =>
          astrologers.find((a) => a.id === row.astrologerId)?.name ?? "",
        header: ({ column }) => (
          <AdminDataTableColumnHeader column={column} label="Astrologer" />
        ),
        cell: ({ row }) => {
          const astrologer = astrologers.find(
            (a) => a.id === row.original.astrologerId,
          );
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={astrologer?.avatarSrc} alt="" />
                <AvatarFallback className="bg-muted text-xs font-semibold">
                  {getInitials(astrologer?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 max-w-36">
                <p className="truncate font-medium">
                  {astrologer?.name ?? "Unknown astrologer"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {astrologer?.primaryExpertise ?? ""}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "mode",
        accessorFn: (row) => row.mode,
        header: ({ column }) => (
          <AdminDataTableColumnHeader column={column} label="Mode" />
        ),
        cell: ({ row }) => <ModeBadge mode={row.original.mode} />,
      },
      {
        id: "lastMessage",
        accessorFn: (row) => row.lastMessagePreview ?? "",
        header: ({ column }) => (
          <AdminDataTableColumnHeader column={column} label="Last message" />
        ),
        cell: ({ row }) => (
          <p className="max-w-44 truncate text-sm leading-5 text-muted-foreground">
            {row.original.lastMessagePreview ?? "No messages"}
          </p>
        ),
      },
      {
        id: "unread",
        accessorFn: (row) => row.unreadCount,
        header: ({ column }) => (
          <AdminDataTableColumnHeader column={column} label="Unread" />
        ),
        cell: ({ row }) =>
          row.original.unreadCount > 0 ? (
            <Badge
              variant="saffron"
              className="h-5 min-h-5 rounded-full px-1.5 text-[10px]"
            >
              {row.original.unreadCount}
            </Badge>
          ) : (
            <span className="pl-2 text-xs text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <AdminDataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant={chatStatusVariants[row.original.status]}
            className="rounded-md px-2 py-0.5"
          >
            {chatStatusLabels[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "updated",
        accessorFn: (row) => row.updatedAt,
        header: ({ column }) => (
          <AdminDataTableColumnHeader column={column} label="Updated" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs leading-5 text-muted-foreground">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Link
              href={`/admin/chats/${row.original.id}`}
              className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Open ${row.original.id}`}
            >
              <Eye className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ),
      },
    ],
    [copied, customers],
  );

  return (
    <section className="space-y-4">
      {/* Page header */}
      <header className="flex items-end gap-3">
        
        <span className="grid size-10 place-items-center rounded-md border border-primary/15 bg-primary/10 text-primary shadow-sm">
          <MessageCircle className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight">Chats</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer and astrologer conversations.
          </p>
        </div>
      </header>

      {/* Underline tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList variant="line">
          {(["all", "open", "unread", "flagged", "closed"] as const).map(
            (item) => (
              <TabsTrigger
                key={item}
                value={item}
                className="group"
              >
                {item[0].toUpperCase() + item.slice(1)}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground group-data-[state=active]:bg-primary/15 group-data-[state=active]:text-primary">
                  {tabCount(item)}
                </span>
              </TabsTrigger>
            ),
          )}
        </TabsList>
      </Tabs>

      {/* Desktop table */}
      <div className="hidden md:block">
        <AdminDataTable
          columns={columns}
          data={filtered}
          initialColumnVisibility={{ mode: false, updated: false }}
          emptyState={
            <span>No conversations match the current filters.</span>
          }
          toolbar={(table) => (
            <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/30 p-1.5">
              <div className="relative min-w-64 flex-1">
                <Search
                  className="absolute left-3 top-2.5 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  className="h-9 bg-surface pl-9 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer, astrologer, ID or message"
                  aria-label="Search conversations"
                />
              </div>
              <Select
                value={mode}
                onValueChange={(v) => setMode(v as typeof mode)}
              >
                <SelectTrigger className="h-9 w-36 bg-surface shadow-sm">
                  <SelectValue placeholder="All modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modes</SelectItem>
                  {(["Chat", "Voice", "Video"] as ConsultationMode[]).map(
                    (m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select value={astrologerId} onValueChange={setAstrologerId}>
                <SelectTrigger className="h-9 w-44 bg-surface shadow-sm">
                  <SelectValue placeholder="All astrologers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All astrologers</SelectItem>
                  {astrologers.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AdminDataTableColumnVisibility table={table} />
            </div>
          )}
        />
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="h-9 bg-surface pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
          />
        </div>
        {filtered.map((conversation) => {
          const customer = customers.find(
            (c) => c.id === conversation.customerId,
          );
          const astrologer = astrologers.find(
            (a) => a.id === conversation.astrologerId,
          );
          return (
            <Card key={conversation.id} className="shadow-sm">
              <CardContent className="space-y-2.5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{conversation.id}</p>
                  <Badge variant={chatStatusVariants[conversation.status]}>
                    {chatStatusLabels[conversation.status]}
                  </Badge>
                </div>
                <p className="text-sm">
                  {customer?.name}{" "}
                  <span className="text-muted-foreground">with</span>{" "}
                  {astrologer?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {conversation.lastMessagePreview}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <ModeBadge mode={conversation.mode} />
                  <div className="flex items-center gap-2">
                    {conversation.unreadCount > 0 && (
                      <Badge variant="saffron">
                        {conversation.unreadCount} unread
                      </Badge>
                    )}
                    <Link
                      href={`/admin/chats/${conversation.id}`}
                      className="text-sm font-medium text-primary"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
