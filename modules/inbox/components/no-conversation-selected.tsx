import { EmptyState } from "@/components/ui/empty-state";

export function NoConversationSelected() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg">
      <EmptyState
        icon={<ChatIcon />}
        title="Nenhuma conversa selecionada"
        description="Escolha uma conversa na lista para começar o atendimento."
      />
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
