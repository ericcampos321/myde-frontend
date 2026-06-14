"use client";

import { useCallback, useDeferredValue, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ContactListItem } from "./contact-list-item";
import { ConversationSearch } from "./conversation-search";
import { RecentSearchesPanel } from "./recent-searches-panel";
import { useContactsQuery } from "@/modules/inbox/hooks/use-contacts-query";
import { useRecentSearchesQuery } from "@/modules/inbox/hooks/use-recent-searches-query";
import { useSaveRecentSearchMutation } from "@/modules/inbox/hooks/use-save-recent-search-mutation";
import { useClearRecentSearchesMutation } from "@/modules/inbox/hooks/use-clear-recent-searches-mutation";
import type { Conversation, RecentSearch } from "@/modules/inbox/types/inbox.types";

interface ContactListProps {
  conversations: Conversation[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ContactList({
  conversations,
  search,
  onSearchChange,
  selectedConversationId,
  onSelectConversation,
}: ContactListProps) {
  const deferredSearch = useDeferredValue(search);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { data = [], isLoading, isError, refetch } = useContactsQuery(deferredSearch);
  const { data: recentSearches = [] } = useRecentSearchesQuery();
  const saveRecentSearch = useSaveRecentSearchMutation();
  const clearRecentSearches = useClearRecentSearchesMutation();
  const isSearching = search.trim().length > 0;
  const shouldShowRecentSearches =
    isSearchMode && !isSearching && recentSearches.length > 0;
  const shouldShowEmptyRecents =
    isSearchMode && !isSearching && recentSearches.length === 0;
  const shouldShowContactList = !isSearchMode || isSearching;
  const handleRecentSearchOpen = useCallback(
    (item: RecentSearch) => {
      if (!item.conversationId) return;
      saveRecentSearch.mutate({
        targetType: item.targetType,
        targetId: item.targetId,
      });
      onSelectConversation(item.conversationId);
      setIsSearchMode(false);
      onSearchChange("");
    },
    [onSelectConversation, saveRecentSearch]
  );

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setIsSearchMode(false);
          onSearchChange("");
        }
      }}
    >
      <div className="shrink-0 bg-sidebar">
        <div className="flex h-[60px] items-center justify-between bg-sidebar pl-5 pr-4">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[19px] font-semibold leading-tight text-text">
              Contatos
            </h2>
            {!isLoading && !isError && data.length > 0 && (
              <span className="min-w-6 rounded-full bg-accent/10 px-2 py-0.5 text-center text-[10px] font-semibold text-accent tabular-nums">
                {data.length}
              </span>
            )}
          </div>
        </div>

        <div className="px-3 py-2">
          <ConversationSearch
            value={search}
            onChange={onSearchChange}
            placeholder="Buscar contato por nome ou telefone"
            onFocus={() => setIsSearchMode(true)}
            onEscape={() => {
              setIsSearchMode(false);
              onSearchChange("");
            }}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {shouldShowRecentSearches && (
          <RecentSearchesPanel
            items={recentSearches}
            onOpen={handleRecentSearchOpen}
            onClear={() => clearRecentSearches.mutate()}
            isClearing={clearRecentSearches.isPending}
          />
        )}

        {shouldShowEmptyRecents && (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] font-medium text-text-muted">
              Nenhuma pesquisa recente
            </p>
          </div>
        )}

        {shouldShowContactList && isLoading && <ContactListSkeleton />}

        {shouldShowContactList && isError && (
          <ErrorState
            message="Não foi possível carregar os contatos."
            retry={() => refetch()}
          />
        )}

        {shouldShowContactList && !isLoading && !isError && data.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] font-medium text-text">Nenhum contato encontrado</p>
            <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
              {search.trim()
                ? "Tente buscar por outro nome ou telefone."
                : "Os contatos que escreverem para este tenant aparecerão aqui."}
            </p>
          </div>
        )}

        {shouldShowContactList && !isLoading && !isError && (
          <div className="flex flex-col">
            {data.map((contact) => {
              const conversation =
                conversations.find((item) => item.contactPhone === contact.phone) ?? null;

              return (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  conversation={conversation}
                  isActive={conversation?.id === selectedConversationId}
                  onOpenConversation={() => {
                    if (conversation) {
                      if (search.trim()) {
                        saveRecentSearch.mutate({
                          targetType: "contact",
                          targetId: contact.id,
                        });
                      }
                      onSelectConversation(conversation.id);
                      setIsSearchMode(false);
                      onSearchChange("");
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[72px] items-center gap-3 px-4"
        >
          <Skeleton className="h-[49px] w-[49px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 border-b border-border py-3">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
