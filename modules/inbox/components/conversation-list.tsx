"use client";

import { useCallback, useMemo, useState } from "react";
import { ConversationSearch } from "./conversation-search";
import { ConversationListItem } from "./conversation-list-item";
import { ContactList } from "./contact-list";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

type RailSection = "conversations" | "contacts";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedId: string | null;
  onSelect: (c: Conversation) => void;
}

export function ConversationList({
  conversations,
  isLoading,
  isFetching,
  isError,
  onRetry,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const [activeSection, setActiveSection] = useState<RailSection>("conversations");
  const [search, setSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const filtered = useMemo(
    () => searchConversations(conversations, search),
    [conversations, search]
  );
  const totalUnreadMessages = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + Math.max(conversation.unread, 0),
        0
      ),
    [conversations]
  );
  const handleSectionChange = useCallback((section: RailSection) => {
    setActiveSection(section);
  }, []);
  const handleConversationSelect = useCallback(
    (conversation: Conversation) => {
      onSelect(conversation);
    },
    [onSelect]
  );
  const handleContactConversationSelect = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((item) => item.id === conversationId);
      if (conversation) {
        onSelect(conversation);
      }
    },
    [conversations, onSelect]
  );

  return (
    <div className="flex h-full min-w-0 overflow-hidden bg-surface">
      <InboxRail
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        unreadCount={totalUnreadMessages}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-surface">
        <div
          className={[
            "h-[2px] shrink-0 bg-accent transition-opacity duration-300",
            isFetching && !isLoading ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-hidden
        />

        {activeSection === "conversations" ? (
          <>
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
                  <PassiveIconButton label="Nova conversa" disabled>
                    <NewConversationIcon />
                  </PassiveIconButton>
                  <PassiveIconButton label="Menu" disabled>
                    <MoreIcon />
                  </PassiveIconButton>
                </div>
              </div>

              <ConversationSearch value={search} onChange={setSearch} />
            </div>

            <div className="flex h-11 shrink-0 items-center gap-3 border-y border-border/35 px-4 text-text-muted transition-colors hover:bg-surface-raised/35">
              <ArchiveIcon />
              <span className="text-[13px] font-medium">Arquivadas</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {isLoading && <ConversationListSkeleton />}

              {isError && (
                <ErrorState
                  message="Não foi possível carregar as conversas."
                  retry={onRetry}
                />
              )}

              {!isLoading && !isError && filtered.length === 0 && (
                <ConversationListEmptyState
                  hasSearch={search.trim().length > 0}
                />
              )}

              {!isLoading && !isError && filtered.map((c) => (
                <ConversationListItem
                  key={c.id}
                  conversation={c}
                  selected={c.id === selectedId}
                  onClick={() => handleConversationSelect(c)}
                />
              ))}
            </div>
          </>
        ) : (
          <ContactList
            conversations={conversations}
            search={contactSearch}
            onSearchChange={setContactSearch}
            selectedConversationId={selectedId}
            onSelectConversation={handleContactConversationSelect}
          />
        )}
      </div>
    </div>
  );
}

export function searchConversations(
  conversations: Conversation[],
  searchTerm: string
): Conversation[] {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

  if (!normalizedSearch) return conversations;

  return conversations.filter(
    (conversation) =>
      conversation.contactName.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
      conversation.lastMessage.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
  );
}

function ConversationListEmptyState({
  hasSearch,
}: {
  hasSearch: boolean;
}) {
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-[13px] font-medium text-text">Nenhuma conversa encontrada</p>
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
        <div key={i} className="flex h-[76px] items-center gap-3.5 border-b border-border/30 px-4">
          <Skeleton className="h-[50px] w-[50px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InboxRail({
  activeSection,
  onSectionChange,
  unreadCount,
}: {
  activeSection: RailSection;
  onSectionChange: (section: RailSection) => void;
  unreadCount: number;
}) {
  return (
    <nav
      className="hidden h-full w-[60px] shrink-0 flex-col items-center border-r border-border/50 bg-[#0a1322] py-3 sm:flex"
      aria-label="Atalhos visuais do inbox"
    >
      <div className="flex w-full justify-center px-2">
        <RailButton label="Myde Inbox">
          <InboxIcon />
        </RailButton>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <RailButton
          label="Conversas"
          active={activeSection === "conversations"}
          onClick={() => onSectionChange("conversations")}
          badgeCount={unreadCount}
        >
          <ChatIcon />
        </RailButton>
        <RailButton
          label="Contatos"
          active={activeSection === "contacts"}
          onClick={() => onSectionChange("contacts")}
        >
          <ContactsIcon />
        </RailButton>
        <RailButton label="Notificações" disabled>
          <NotificationIcon />
        </RailButton>
        <RailButton label="Automação" disabled>
          <AutomationIcon />
        </RailButton>
      </div>

      <div className="my-4 h-px w-8 bg-white/8" />

      <div className="mt-auto flex flex-col items-center gap-2.5 pb-1">
        <RailButton label="Configurações" disabled>
          <SettingsIcon />
        </RailButton>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(145deg,#1e80ff,#174a91)] text-xs font-bold text-white ring-1 ring-white/10">
          M
        </span>
      </div>
    </nav>
  );
}

function RailButton({
  label,
  active = false,
  disabled = false,
  onClick,
  badgeCount = 0,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  badgeCount?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled ? "true" : undefined}
      disabled={disabled}
      onClick={onClick}
      title={disabled ? `${label} ainda não disponível` : undefined}
      className={[
        "relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-150",
        active
          ? "bg-accent/16 text-accent shadow-[inset_0_0_0_1px_rgba(30,128,255,0.1)]"
          : disabled
            ? "cursor-default text-text-muted/35 opacity-65"
            : "text-text-muted hover:bg-white/6 hover:text-text",
      ].join(" ")}
    >
      {!disabled && badgeCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1.5 py-[2px] text-[10px] font-semibold leading-none text-white shadow-[0_0_0_2px_rgba(10,19,34,1)]">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
      {active && <span className="absolute -left-[10px] h-5 w-[3px] rounded-r-full bg-accent" />}
      {children}
    </button>
  );
}

function PassiveIconButton({
  label,
  disabled = false,
  children,
}: {
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled ? "true" : undefined}
      disabled={disabled}
      title={disabled ? `${label} ainda não disponível` : undefined}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        disabled
          ? "cursor-default text-text-muted/45 opacity-70"
          : "text-text-muted hover:bg-surface-raised/80 hover:text-text",
      ].join(" ")}
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
