import { EmptyState } from "@/components/ui/empty-state";

const panelBackgroundStyle = {
  backgroundImage:
    "linear-gradient(rgba(2, 6, 13, 0.55), rgba(2, 6, 13, 0.55)), url('/brand/background-plan.png')",
  backgroundRepeat: "repeat",
  backgroundSize: "560px auto",
  backgroundPosition: "center",
} as const;

export function NoConversationSelected() {
  return (
    <div
      className="flex flex-1 items-center justify-center"
      style={panelBackgroundStyle}
    >
      <div className="rounded-2xl border border-border/60 bg-surface/70 px-2 py-3 backdrop-blur-sm">
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
