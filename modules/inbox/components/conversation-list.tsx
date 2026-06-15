"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { ConversationSearch } from "./conversation-search";
import { ConversationListItem } from "./conversation-list-item";
import { ContactList } from "./contact-list";
import { RecentSearchesPanel } from "./recent-searches-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useRecentSearchesQuery } from "@/modules/inbox/hooks/use-recent-searches-query";
import { useSaveRecentSearchMutation } from "@/modules/inbox/hooks/use-save-recent-search-mutation";
import { useClearRecentSearchesMutation } from "@/modules/inbox/hooks/use-clear-recent-searches-mutation";
import type { Conversation, RecentSearch } from "@/modules/inbox/types/inbox.types";

type RailSection = "conversations" | "contacts";
type ConversationFilter = "all" | "unread";

const CONVERSATION_FILTERS: { id: ConversationFilter; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "unread", label: "Não lidas" },
];

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedId: string | null;
  onSelect: (c: Conversation) => void;
}

export function ConversationList({ conversations, isLoading, isFetching, isError, onRetry, selectedId, onSelect }: ConversationListProps) {
  const [activeSection, setActiveSection] = useState<RailSection>("conversations");
  const [searchTerm, setSearchTerm] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all");
  const { data: recentSearches = [] } = useRecentSearchesQuery();
  const saveRecentSearch = useSaveRecentSearchMutation();
  const clearRecentSearches = useClearRecentSearchesMutation();
  const filtered = useMemo(() => {
    const bySearch = searchConversations(conversations, searchTerm);
    switch (activeFilter) {
      case "unread":
        return bySearch.filter((conversation) => conversation.unread > 0);
      default:
        return bySearch;
    }
  }, [conversations, searchTerm, activeFilter]);
  const isSearching = searchTerm.trim().length > 0;
  const shouldShowSearchPanel = isSearchFocused || isSearching;
  const shouldShowRecentSearches = shouldShowSearchPanel && !isSearching;
  const shouldShowArchiveRow = !isSearching;
  const totalUnreadMessages = useMemo(
    () => conversations.reduce((total, conversation) => total + Math.max(conversation.unread, 0), 0),
    [conversations]
  );
  const handleSectionChange = useCallback((section: RailSection) => {
    setActiveSection(section);
  }, []);
  const openConversationFromSidebar = useCallback(
    (conversation: Conversation) => {
      setActiveSection("conversations");
      setIsSearchFocused(false);
      setSearchTerm("");
      setContactSearch("");
      onSelect(conversation);
    },
    [onSelect]
  );
  const handleConversationSelect = useCallback(
    (conversation: Conversation) => {
      if (searchTerm.trim()) {
        saveRecentSearch.mutate({
          targetType: "conversation",
          targetId: conversation.id,
        });
      }
      openConversationFromSidebar(conversation);
    },
    [openConversationFromSidebar, saveRecentSearch, searchTerm]
  );
  const handleRecentSearchOpen = useCallback(
    (item: RecentSearch) => {
      if (!item.canOpen || !item.conversationId) return;
      const conversation = conversations.find((candidate) => candidate.id === item.conversationId);
      if (!conversation) return;

      saveRecentSearch.mutate({
        targetType: item.targetType,
        targetId: item.targetId,
      });
      openConversationFromSidebar(conversation);
    },
    [conversations, openConversationFromSidebar, saveRecentSearch]
  );
  const handleContactConversationSelect = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((item) => item.id === conversationId);
      if (conversation) {
        openConversationFromSidebar(conversation);
      }
    },
    [conversations, openConversationFromSidebar]
  );

  return (
    <div className="flex h-full min-w-0 overflow-hidden bg-sidebar">
      <InboxRail activeSection={activeSection} onSectionChange={handleSectionChange} unreadCount={totalUnreadMessages} />

      <div
        className="flex min-w-0 flex-1 flex-col overflow-hidden border-l border-border bg-sidebar shadow-[-1px_0_0_0_var(--divider-strong)]"
        onBlurCapture={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
            setIsSearchFocused(false);
          }
        }}
      >
        <div
          className={[
            "h-[2px] shrink-0 bg-accent transition-opacity duration-650",
            isFetching && !isLoading ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-hidden
        />

        {activeSection === "conversations" ? (
          <>
            <div className="shrink-0 bg-sidebar">
              <div className="flex h-[61px] items-center justify-between bg-sidebar pl-5 pr-4">
                <div className="flex min-w-0 items-center">
                  <Image
                    src="/brand/background-plan.png"
                    alt="Myde Inbox"
                    width={172}
                    height={34}
                    className="h-auto w-[172px] object-contain"
                    priority
                  />
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

              <div className="px-3 py-2">
                <ConversationSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onFocus={() => setIsSearchFocused(true)}
                  onEscape={() => {
                    setIsSearchFocused(false);
                    setSearchTerm("");
                  }}
                />
              </div>

              <div
                aria-hidden={!shouldShowRecentSearches}
                className={[
                  "grid overflow-hidden transition-[grid-template-rows,opacity,transform,margin] duration-200 ease-out",
                  shouldShowRecentSearches
                    ? "grid-rows-[1fr] translate-y-0 opacity-100 mb-1"
                    : "grid-rows-[0fr] -translate-y-1 opacity-0 mb-0",
                ].join(" ")}
              >
                <div className="min-h-0">
                  {recentSearches.length > 0 ? (
                    <RecentSearchesPanel
                      items={recentSearches}
                      onOpen={handleRecentSearchOpen}
                      onClear={() => clearRecentSearches.mutate()}
                      isClearing={clearRecentSearches.isPending}
                    />
                  ) : (
                    <SearchModeEmptyState message="Nenhuma pesquisa recente" compact />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto px-3 pt-1 pb-1.5">
                {CONVERSATION_FILTERS.map((filter) => (
                  <FilterPill
                    key={filter.id}
                    label={filter.label}
                    active={activeFilter === filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                  />
                ))}
              </div>
            </div>

            {shouldShowArchiveRow && (
              <button
                type="button"
                className="flex h-[45px] w-full shrink-0 items-center gap-3 border-b border-border px-5 text-[#8696a0] transition-colors hover:bg-surface-raised hover:text-text"
              >
                <ArchiveIcon />
                <span className="text-[14px] font-medium">Arquivadas</span>
              </button>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {isLoading && <ConversationListSkeleton />}

              {isError && <ErrorState message="Não foi possível carregar as conversas." retry={onRetry} />}

              {!isLoading && !isError && filtered.length === 0 && (
                <ConversationListEmptyState hasSearch={isSearching} activeFilter={activeFilter} />
              )}

              {!isLoading && !isError && (
                <div className="flex flex-col">
                  {filtered.map((c) => (
                    <ConversationListItem
                      key={c.id}
                      conversation={c}
                      selected={c.id === selectedId}
                      onClick={() => handleConversationSelect(c)}
                    />
                  ))}
                </div>
              )}
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

export function searchConversations(conversations: Conversation[], searchTerm: string): Conversation[] {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");

  if (!normalizedSearch) return conversations;

  return conversations.filter(
    (conversation) =>
      conversation.contactName.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
      conversation.lastMessage.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
  );
}

function ConversationListEmptyState({ hasSearch, activeFilter }: { hasSearch: boolean; activeFilter: ConversationFilter }) {
  const { title, hint } = resolveEmptyState(hasSearch, activeFilter);
  return (
    <div className="px-5 py-8 text-center">
      <p className="text-[13px] font-medium text-text">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{hint}</p>
    </div>
  );
}

function resolveEmptyState(hasSearch: boolean, activeFilter: ConversationFilter): { title: string; hint: string } {
  if (hasSearch) {
    return {
      title: "Nenhuma conversa encontrada",
      hint: "Tente buscar por outro nome ou mensagem.",
    };
  }
  switch (activeFilter) {
    case "unread":
      return { title: "Tudo em dia", hint: "Nenhuma conversa não lida." };
    default:
      return {
        title: "Nenhuma conversa encontrada",
        hint: "Novas conversas aparecerão aqui.",
      };
  }
}

function SearchModeEmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div className={compact ? "px-5 pb-2 pt-1 text-center" : "px-5 py-8 text-center"}>
      <p className="text-[13px] font-medium text-text-muted">{message}</p>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex h-[72px] items-center gap-3 px-4">
          <Skeleton className="h-[49px] w-[49px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 border-b border-border py-3">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "flex shrink-0 items-center rounded-2xl px-3 py-[5px] text-[13px] font-medium transition-colors",
        active ? "bg-accent/15 text-accent" : "text-text-muted hover:bg-surface-raised hover:text-text",
      ].join(" ")}
    >
      {label}
    </button>
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
      className="hidden h-full w-[65px] min-w-[65px] shrink-0 flex-col items-center border-r border-border bg-sidebar-rail shadow-[1px_0_0_0_var(--divider-strong)] py-0 sm:flex"
      aria-label="Atalhos visuais do inbox"
    >
      <div className="my-[10px] flex w-full justify-center px-2">
        <TopRailButton label="Myde Inbox">
          <InboxIcon />
        </TopRailButton>
      </div>

      <div className="flex w-full flex-1 flex-col items-center">
        <RailButton
          label="Conversas"
          active={activeSection === "conversations"}
          onClick={() => onSectionChange("conversations")}
          badgeCount={unreadCount}
        >
          <ChatIcon />
        </RailButton>
        <RailButton label="Contatos" active={activeSection === "contacts"} onClick={() => onSectionChange("contacts")}>
          <ContactsIcon />
        </RailButton>
      </div>

      <div className="mt-auto flex flex-col items-center pb-1">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-surface-active text-[13px] font-semibold text-text">
          M
        </span>
      </div>
    </nav>
  );
}

function RailButton({
  label,
  active = false,
  onClick,
  badgeCount = 0,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  badgeCount?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={[
        "relative flex h-[52px] w-[72px] cursor-pointer items-center justify-center transition-colors duration-150",
        active ? "text-text" : "text-text-muted hover:text-text",
      ].join(" ")}
    >
      {badgeCount > 0 && (
        <span className="absolute right-[14px] top-[7px] inline-flex h-[9px] w-[9px] items-center justify-center rounded-full bg-accent text-[0px] leading-none text-transparent">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
      <span
        className={[
          "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150",
          active ? "bg-white/10 text-text" : "bg-transparent text-inherit hover:bg-white/8",
        ].join(" ")}
      >
        {children}
      </span>
    </button>
  );
}

function TopRailButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#374045] text-text-muted transition-colors hover:text-text"
    >
      {children}
    </button>
  );
}

function PassiveIconButton({ label, disabled = false, children }: { label: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled ? "true" : undefined}
      disabled={disabled}
      title={disabled ? `${label} ainda não disponível` : undefined}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        disabled ? "cursor-default text-text-muted/45 opacity-70" : "text-text-muted hover:bg-white/10 hover:text-text",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function IconBase({ children, size = 19 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

function InboxIcon() {
  return (
    <IconBase size={20}>
      <path d="M6 7h12v10H6zM9 10h6M9 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function ChatIcon() {
  return (
    <IconBase size={22}>
      <path
        d="M20 15a3 3 0 0 1-3 3H8l-4 3v-6a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

function ContactsIcon() {
  return (
    <IconBase size={22}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M16 5.5a3 3 0 0 1 0 5.8M17 13c2.2.6 3.4 2.5 3.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

function NewConversationIcon() {
  return (
    <IconBase size={22}>
      <path d="M5 5h14v11H8l-3 3zM12 8v5M9.5 10.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconBase>
  );
}

function MoreIcon() {
  return (
    <IconBase size={22}>
      <circle cx="12" cy="5" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" />
    </IconBase>
  );
}

function ArchiveIcon() {
  return (
    <IconBase size={20}>
      <path
        d="M4 7h16v13H4zM3 4h18v3H3zM9 12h6M12 10v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
