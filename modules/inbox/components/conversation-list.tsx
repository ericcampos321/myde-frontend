"use client";

import { useState } from "react";
import { useConversationsQuery } from "@/modules/inbox/hooks/use-conversations-query";
import { ConversationSearch } from "./conversation-search";
import { ConversationListItem } from "./conversation-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

type ConversationFilter = "all" | "unread";

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (c: Conversation) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all");
  const { data, isLoading, isFetching, isError, refetch } = useConversationsQuery();

  const conversations = data ?? [];
  const filtered = filterConversations(conversations, activeFilter, search);
  const unreadCount = conversations.filter((conversation) => conversation.unread > 0).length;

  return (
    <div className="flex h-full min-w-0 overflow-hidden bg-surface">
      <InboxRail />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface">
        <div
          className={[
            "h-[2px] shrink-0 bg-accent transition-opacity duration-300",
            isFetching && !isLoading ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-hidden
        />

        <div className="shrink-0 bg-surface px-3 pb-2.5 pt-3">
          <div className="mb-3 flex h-8 items-center justify-between px-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-lg font-semibold tracking-tight text-text">
                Conversas
              </h2>
              {!isLoading && !isError && conversations.length > 0 && (
                <span className="min-w-6 rounded-full bg-accent/10 px-2 py-0.5 text-center text-[10px] font-semibold text-accent tabular-nums">
                  {conversations.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <PassiveIconButton label="Nova conversa">
                <NewConversationIcon />
              </PassiveIconButton>
              <PassiveIconButton label="Menu">
                <MoreIcon />
              </PassiveIconButton>
            </div>
          </div>

          <ConversationSearch value={search} onChange={setSearch} />

          <div className="mt-2.5 flex gap-1.5 overflow-hidden px-0.5" aria-label="Filtros de conversas">
            <FilterChip
              label="Todas"
              count={conversations.length}
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            />
            <FilterChip
              label="Não lidas"
              count={unreadCount}
              active={activeFilter === "unread"}
              onClick={() => setActiveFilter("unread")}
            />
          </div>
        </div>

        <div className="flex h-12 shrink-0 items-center gap-3 border-y border-border/40 px-4 text-text-muted">
          <ArchiveIcon />
          <span className="text-[13px] font-medium">Arquivadas</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {isLoading && <ConversationListSkeleton />}

          {isError && (
            <ErrorState
              message="Não foi possível carregar as conversas."
              retry={() => refetch()}
            />
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <ConversationListEmptyState
              activeFilter={activeFilter}
              hasSearch={search.trim().length > 0}
            />
          )}

          {!isLoading && !isError && filtered.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              selected={c.id === selectedId}
              onClick={() => onSelect(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function filterConversations(
  conversations: Conversation[],
  activeFilter: ConversationFilter,
  searchTerm: string
): Conversation[] {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

  return conversations
    .filter((conversation) => activeFilter === "all" || conversation.unread > 0)
    .filter((conversation) => {
      if (!normalizedSearch) return true;

      return (
        conversation.contactName.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        conversation.lastMessage.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      );
    });
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? "border-accent/30 bg-accent/15 text-accent"
          : "border-border/70 bg-surface text-text-muted hover:bg-surface-raised hover:text-text",
      ].join(" ")}
    >
      <span>{label}</span>
      <span className={active ? "text-accent/75" : "text-text-muted/65"}>{count}</span>
    </button>
  );
}

function ConversationListEmptyState({
  activeFilter,
  hasSearch,
}: {
  activeFilter: ConversationFilter;
  hasSearch: boolean;
}) {
  const title = hasSearch
    ? "Nenhuma conversa encontrada"
    : activeFilter === "unread"
      ? "Nenhuma conversa não lida"
      : "Nenhuma conversa encontrada";

  return (
    <div className="px-5 py-8 text-center">
      <p className="text-[13px] font-medium text-text">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
        {hasSearch ? "Tente buscar por outro nome ou mensagem." : "Novas conversas aparecerão aqui."}
      </p>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex h-[76px] items-center gap-3.5 border-b border-border/35 px-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InboxRail() {
  return (
    <nav
      className="hidden h-full w-[60px] shrink-0 flex-col items-center border-r border-border/55 bg-bg/80 py-2.5 sm:flex"
      aria-label="Atalhos visuais do inbox"
    >
      <RailButton label="Myde Inbox">
        <InboxIcon />
      </RailButton>

      <div className="mt-3 flex flex-col gap-1.5">
        <RailButton label="Conversas" active>
          <ChatIcon />
        </RailButton>
        <RailButton label="Notificações">
          <NotificationIcon />
        </RailButton>
        <RailButton label="Contatos">
          <ContactsIcon />
        </RailButton>
        <RailButton label="Automação">
          <AutomationIcon />
        </RailButton>
      </div>

      <div className="my-3 h-px w-8 bg-border/70" />

      <div className="mt-auto flex flex-col items-center gap-2">
        <RailButton label="Configurações">
          <SettingsIcon />
        </RailButton>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(145deg,#1e80ff,#174a91)] text-xs font-bold text-white ring-1 ring-white/10">
          M
        </span>
      </div>
    </nav>
  );
}

function RailButton({
  label,
  active = false,
  children,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled="true"
      className={[
        "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        active
          ? "bg-accent/15 text-accent"
          : "text-text-muted hover:bg-surface-raised hover:text-text",
      ].join(" ")}
    >
      {active && <span className="absolute -left-2.5 h-6 w-[3px] rounded-r-full bg-accent" />}
      {children}
    </button>
  );
}

function PassiveIconButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled="true"
      className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
    >
      {children}
    </button>
  );
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

function InboxIcon() {
  return <IconBase><path d="M4 5h16v14H4zM8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function ChatIcon() {
  return <IconBase><path d="M20 15a3 3 0 0 1-3 3H8l-4 3v-6a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></IconBase>;
}

function NotificationIcon() {
  return <IconBase><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7M14 20h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function ContactsIcon() {
  return <IconBase><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M16 5.5a3 3 0 0 1 0 5.8M17 13c2.2.6 3.4 2.5 3.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></IconBase>;
}

function AutomationIcon() {
  return <IconBase><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></IconBase>;
}

function SettingsIcon() {
  return <IconBase><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.5 1A8 8 0 0 0 15 6l-.4-2.7h-4L10 6a8 8 0 0 0-1.4 1L6 6 4 9.5 6.1 11a7 7 0 0 0 0 2L4 14.5 6 18l2.6-1a8 8 0 0 0 1.4 1l.5 2.7h4L15 18a8 8 0 0 0 1.4-1l2.5 1 2-3.5-2-1.5a7 7 0 0 0 .1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></IconBase>;
}

function NewConversationIcon() {
  return <IconBase><path d="M5 5h14v11H8l-3 3zM12 8v5M9.5 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}

function MoreIcon() {
  return <IconBase><circle cx="12" cy="5" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="19" r="1.4" fill="currentColor" /></IconBase>;
}

function ArchiveIcon() {
  return <IconBase><path d="M4 7h16v13H4zM3 4h18v3H3zM9 12h6M12 10v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}
