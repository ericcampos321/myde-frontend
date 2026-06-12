"use client";

import { useState } from "react";
import { useConversationsQuery } from "@/modules/inbox/hooks/use-conversations-query";
import { ConversationSearch } from "./conversation-search";
import { ConversationListItem } from "./conversation-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { Conversation } from "@/modules/inbox/types/inbox.types";

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (c: Conversation) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useConversationsQuery();

  const filtered = (data ?? []).filter((c) =>
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 px-3 pt-3 pb-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted px-0.5 mb-2">
          Conversas
        </p>
        <ConversationSearch value={search} onChange={setSearch} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <ConversationListSkeleton />}

        {isError && (
          <ErrorState
            message="Não foi possível carregar as conversas."
            retry={() => refetch()}
          />
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            title={search ? "Nenhum resultado" : "Sem conversas"}
            description={
              search
                ? `Nenhuma conversa corresponde a "${search}".`
                : "Aguardando novas mensagens."
            }
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
  );
}

function ConversationListSkeleton() {
  return (
    <div className="flex flex-col gap-0.5 p-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
