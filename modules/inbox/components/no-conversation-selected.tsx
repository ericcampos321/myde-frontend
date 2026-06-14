import { EmptyState } from "@/components/ui/empty-state";

export function NoConversationSelected() {
  return (
    <div className="chat-bg flex flex-1 items-center justify-center">
      <div className="max-w-md rounded-2xl px-6 py-4 text-center">
        <EmptyState
          icon={
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <ChatIcon />
            </span>
          }
          title="Nenhuma conversa selecionada"
          description="Escolha uma conversa na lista para começar o atendimento."
        />
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
