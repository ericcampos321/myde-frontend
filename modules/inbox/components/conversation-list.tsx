"use client";

import type { Conversation } from "@/modules/inbox/types/inbox.types";

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (c: Conversation) => void;
}

export function ConversationList(_props: ConversationListProps) {
  return null;
}
