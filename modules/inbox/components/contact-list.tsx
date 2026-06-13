"use client";

import { useDeferredValue } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ContactListItem } from "./contact-list-item";
import { ConversationSearch } from "./conversation-search";
import { useContactsQuery } from "@/modules/inbox/hooks/use-contacts-query";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

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
  const { data = [], isLoading, isError, refetch } = useContactsQuery(deferredSearch);

  return (
    <>
      <div className="shrink-0 bg-surface px-3 pb-2.5 pt-3">
        <div className="mb-3 flex h-8 items-center justify-between px-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-lg font-semibold tracking-tight text-text">
              Contatos
            </h2>
            {!isLoading && !isError && data.length > 0 && (
              <span className="min-w-6 rounded-full bg-accent/10 px-2 py-0.5 text-center text-[10px] font-semibold text-accent tabular-nums">
                {data.length}
              </span>
            )}
          </div>
        </div>

        <ConversationSearch
          value={search}
          onChange={onSearchChange}
          placeholder="Buscar contato por nome ou telefone"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading && <ContactListSkeleton />}

        {isError && (
          <ErrorState
            message="Não foi possível carregar os contatos."
            retry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] font-medium text-text">Nenhum contato encontrado</p>
            <p className="mt-1 text-[11px] leading-relaxed text-text-muted">
              {search.trim()
                ? "Tente buscar por outro nome ou telefone."
                : "Os contatos que escreverem para este tenant aparecerão aqui."}
            </p>
          </div>
        )}

        {!isLoading && !isError && data.map((contact) => {
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
                  onSelectConversation(conversation.id);
                }
              }}
            />
          );
        })}
      </div>
    </>
  );
}

function ContactListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[76px] items-center gap-3.5 border-b border-border/30 px-4"
        >
          <Skeleton className="h-[50px] w-[50px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
