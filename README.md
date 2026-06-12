# Myde Frontend — Inbox de Atendimento WhatsApp com IA

Desafio técnico frontend sênior. Interface de inbox de suporte via WhatsApp com sugestão de resposta por IA.

## Como rodar

```bash
cp .env.example .env.local
npm install
npm run dev
```

Acesse: http://localhost:3000

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base do backend (hospedado por padrão) |

O backend já está hospedado e funcional. Não é necessário rodá-lo localmente, mas há um servidor de desenvolvimento local em `desafio-frontend-nextjs/server/` se necessário.

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servir build de produção |
| `npm run lint` | Análise ESLint |
| `npm run typecheck` | Verificação TypeScript sem emitir |

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| Next.js | 15.5 | Framework (App Router) |
| React | 19 | UI |
| TypeScript | 5.7 | Tipagem estática |
| Tailwind CSS | 4.0 | Estilos (utility-first) |
| React Query | 5.62 | Cache, polling e mutações |
| Axios | 1.7 | Cliente HTTP centralizado |

## Contratos de API

Base URL: `NEXT_PUBLIC_API_URL` (padrão: `https://8tymn68hp9.execute-api.us-east-1.amazonaws.com`)

### Endpoints

```
GET  /me
     → Agent { id, name, role }

GET  /conversations
     → Conversation[] (ordenadas por lastMessageAt DESC)

GET  /conversations/:id/messages
     → Message[] (ordenadas por createdAt ASC)

POST /conversations/:id/messages
     Body: { text: string }
     → Message (HTTP 201)

POST /ai/suggest
     Body: { conversationId: string }
     → AiSuggestion { suggestion, source }
```

### Tipos principais

```typescript
Conversation {
  id: string
  contactName: string
  contactPhone: string
  avatarColor: string       // cor do avatar gerada no seed
  unread: number
  lastMessage: string
  lastMessageAt: string     // ISO 8601
}

Message {
  id: string
  direction: "in" | "out"  // "in" = cliente, "out" = atendente
  body: string
  status: "sent" | "delivered" | "read"
  createdAt: string         // ISO 8601
}

Agent {
  id: string
  name: string
  role: string
}

AiSuggestion {
  suggestion: string
  source: "openai" | "mock" | "mock-fallback"
}
```

### Padrão de erro da API

```json
{ "error": "mensagem descritiva" }
```

Status HTTP usados: `200`, `201`, `400`, `401`, `404`.

## Arquitetura do frontend

### Estrutura de pastas

```
app/
  layout.tsx          — root layout (Server Component, fino)
  page.tsx            — entry point, monta InboxPage
  providers.tsx       — QueryClientProvider (Client Component)
  globals.css         — variáveis CSS + reset Tailwind

components/
  ui/                 — componentes de design system (puros, sem domínio)
    button.tsx
    input.tsx
    textarea.tsx
    badge.tsx
    card.tsx
    avatar.tsx
    skeleton.tsx
    spinner.tsx
    empty-state.tsx
    error-state.tsx
  shared/
    app-shell.tsx     — wrapper de layout global

modules/
  inbox/
    components/       — componentes de domínio do inbox
      inbox-page.tsx
      inbox-layout.tsx
      conversation-list.tsx
      conversation-list-item.tsx
      conversation-search.tsx
      chat-panel.tsx
      message-list.tsx
      message-bubble.tsx
      message-composer.tsx
      ai-suggestion-button.tsx
      no-conversation-selected.tsx
    hooks/            — React Query por recurso
      use-me-query.ts
      use-conversations-query.ts
      use-conversation-messages-query.ts
      use-send-message-mutation.ts
      use-ai-suggestion-mutation.ts
    services/         — funções de chamada HTTP
      inbox.service.ts
    types/            — tipos do domínio
      inbox.types.ts

services/
  http/
    api-client.ts     — instância Axios configurada
    api-error.ts      — normalização de erros

utils/
  cn.ts               — merge de classes Tailwind (clsx)
  format-message-time.ts
  get-contact-initials.ts
```

### Princípios de separação

- `app/page.tsx` não contém lógica — apenas monta `<InboxPage />`
- Chamadas HTTP ficam exclusivamente em `modules/inbox/services/` e `services/http/`
- Hooks React Query ficam em `modules/inbox/hooks/`
- Componentes visuais puros em `components/ui/` — sem queries, sem domínio
- Componentes de domínio em `modules/inbox/components/` — podem usar hooks
- Server Components: `app/layout.tsx`, `app/page.tsx`
- Client Components: tudo em `modules/`, `components/ui/`, `providers.tsx`

## Estratégia React Query

### Query keys

```typescript
["me"]
["conversations"]
["conversation-messages", conversationId]
```

### Polling

| Query | Intervalo | Condição |
|---|---|---|
| conversations | 12 segundos | sempre ativo |
| messages | 5 segundos | só com conversa selecionada |

### Envio otimista de mensagem

1. `onMutate`: cancela query de mensagens, insere mensagem local com `id: "optimistic-*"`
2. `onError`: rollback restaurando snapshot anterior
3. `onSettled`: invalida `["conversation-messages", id]` e `["conversations"]`

### Sugestão IA

- Mutation separada, não altera cache de mensagens
- Preenche apenas o estado local do composer (textarea)
- Erro da IA não quebra o chat — capturado isoladamente

## Identidade visual

Paleta dark premium da Myde:

| Token | Valor |
|---|---|
| Background | `#02060D` |
| Surface / card | `#0B111C` |
| Border | `#1F2A3D` |
| Accent / primary | `#1E80FF` |
| Text | `#F8FAFC` |
| Text muted | `#7C8CA3` |

## O que faria com mais tempo

- Autenticação real com JWT e refresh token
- Notificações push para novas mensagens
- Suporte a mensagens com mídia (imagem, áudio)
- Testes unitários dos hooks e componentes críticos (Vitest + Testing Library)
- Storybook para o design system
- Virtualização da lista de mensagens longas (TanStack Virtual)
- Paginação/cursor nas queries de mensagens e conversas
- WebSocket em vez de polling para latência menor
- i18n
