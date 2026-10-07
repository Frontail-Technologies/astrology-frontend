"use client";

import { getInitials } from "../lib/format";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { Conversation } from "@/features/chats/types/conversation";
import type { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";

const shortTime = (value: string) => {
  const date = new Date(value);
  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(
    "en-IN",
    sameDay
      ? { hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "short" },
  ).format(date);
};

export function ChatConversationList({
  currentId,
  records,
  customers,
  search,
  onSearchChange,
}: {
  currentId: string;
  records: Conversation[];
  customers: ReturnType<typeof useCustomerRepository>["records"];
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const query = search.trim().toLowerCase();
  const rows = records
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .filter((item) => {
      if (!query) return true;
      const customer = customers.find((c) => c.id === item.customerId);
      return (
        item.id.toLowerCase().includes(query) ||
        customer?.name?.toLowerCase().includes(query) ||
        item.lastMessagePreview?.toLowerCase().includes(query)
      );
    });

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="shrink-0 space-y-2 border-b border-border px-3 py-2.5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Conversations
        </h2>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            className="h-8 bg-background pl-8 text-xs shadow-none"
            aria-label="Search conversations"
          />
        </div>
      </div>

      <nav
        aria-label="Conversation list"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {rows.map((item) => {
          const customer = customers.find((c) => c.id === item.customerId);
          const active = item.id === currentId;
          return (
            <Link
              key={item.id}
              href={`/admin/chats/${item.id}`}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 border-b border-border/60 border-l-2 px-3 py-2 transition-colors ${
                active
                  ? "border-l-primary bg-primary/10"
                  : "border-l-transparent hover:bg-muted/50"
              }`}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback
                  className={`text-[11px] font-semibold ${
                    active
                      ? "bg-primary/20 text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getInitials(customer?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={`truncate text-[13px] text-foreground ${
                      active ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {customer?.name ?? item.customerId}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {shortTime(item.updatedAt)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                    {item.lastMessagePreview ?? "No messages"}
                  </p>
                  {item.unreadCount > 0 && (
                    <span className="inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
                      {item.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
        {rows.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            No conversations found.
          </p>
        )}
      </nav>
    </div>
  );
}
