# Myde Inbox — Frontend Challenge

Inbox de atendimento WhatsApp com sugestão de resposta por IA.
Entrega do desafio técnico frontend sênior.

---

## Funcionalidades entregues

- Lista de conversas com contato, última mensagem, horário e indicador de não-lidas
- Busca e filtro local em tempo real
- Tela de chat com histórico de mensagens
- Bolhas diferenciadas por direção (`in` = cliente / `out` = atendente) com status de envio
- Envio de mensagem com **atualização otimista** — aparece antes da confirmação da API
- Rollback automático em caso de erro no envio
- Botão "Sugerir IA" — chama `POST /ai/suggest`, preenche o composer, permite edição antes de enviar
- Erro de sugestão IA isolado — não bloqueia o chat
- **Polling moderado**: conversas a cada 12s, mensagens a cada 5s (só com conversa ativa)
- Indicador discreto de sincronização em background (barra azul na sidebar)
- Estados visuais: loading skeleton, erro com retry, empty state em todas as superfícies
- Layout responsivo: sidebar + chat no desktop, navegação alternada no mobile
- Visual dark premium alinhado à identidade Myde (`#02060D` background, `#1E80FF` accent)
- Acessibilidade básica: `aria-label` em ações, `role="log"` no chat, `role="alert"` em erros, foco visível

---

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| Next.js | ^15.5.19 | Framework — App Router |
| React | 19.0.0 | UI |
| TypeScript | ^5.7.0 | Tipagem estática |
| Tailwind CSS | ^4.0.0 | Estilos utility-first |
| TanStack React Query | ^5.62.0 | Data fetching, cache e mutações |
| Axios | ^1.7.9 | Cliente HTTP centralizado |
| clsx + tailwind-merge | ^2 / ^3 | Composição de classes Tailwind |

> Backend fornecido e hospedado. Não é necessário implementar nem rodar localmente.

---

## Como rodar

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env.local

# 2. Instalar dependências
npm install

# 3. Iniciar em desenvolvimento
npm run dev
```

Acesse: **http://localhost:3000**

### Validação

```bash
npm run typecheck   # TypeScript sem emitir arquivos
npm run lint        # ESLint
npm run build       # Build de produção
```

A entrega está limpa nos três comandos.

---

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API (backend já hospedado) |

O arquivo `.env.example` contém a URL hospedada padrão. Copie para `.env.local` — este arquivo **não deve ser commitado** (já está no `.gitignore`).

`NEXT_PUBLIC_API_URL` é obrigatória. Se ausente, a aplicação falha explicitamente ao iniciar — sem fallback silencioso. O valor ativo deve sempre apontar para a API hospedada.

---

## Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| dev | `npm run dev` | Servidor de desenvolvimento |
| build | `npm run build` | Build de produção |
| start | `npm run start` | Servir o build de produção |
| lint | `npm run lint` | ESLint |
| typecheck | `npm run typecheck` | Verificação TypeScript (`tsc --noEmit`) |

---

## Arquitetura

### Estrutura de pastas

```
app/
  layout.tsx              — Root layout (Server Component, fino)
  page.tsx                — Entry point: apenas monta <InboxPage />
  providers.tsx           — QueryClientProvider (Client Component)
  globals.css             — Variáveis CSS Myde + reset Tailwind v4

components/
  ui/                     — Design system: componentes visuais puros, sem domínio
    avatar.tsx
    badge.tsx
    button.tsx
    card.tsx
    empty-state.tsx
    error-state.tsx
    input.tsx
    skeleton.tsx
    spinner.tsx
    textarea.tsx
  shared/
    app-shell.tsx         — Layout responsivo desktop/mobile

modules/
  inbox/
    components/           — Componentes de domínio do inbox
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
    hooks/                — React Query por recurso (padrão use*Query / use*Mutation)
      inbox-query-keys.ts   — Query keys centralizadas do domínio
      use-me-query.ts
      use-conversations-query.ts
      use-conversation-messages-query.ts
      use-send-message-mutation.ts
      use-ai-suggestion-mutation.ts
    services/             — Transporte e rotas da API
      inbox.endpoints.ts    — Endpoints centralizados do domínio
      inbox.service.ts      — Funções de chamada HTTP
    types/                — Contratos de domínio
      inbox.types.ts
    utils/
      format-message-time.ts

config/
  env.ts                  — Env pública centralizada (única leitura de process.env)

services/
  http/
    api-client.ts         — Instância Axios (consome config/env, sem process.env direto)
    api-error.ts          — Normalização de erros da API

utils/
  cn.ts                   — Merge de classes Tailwind (clsx + tailwind-merge)
```

Não há código herdado do starter: a aplicação consome exclusivamente a arquitetura
em `services/http/` e `modules/inbox/`. Endpoints e query keys são centralizados por
domínio, sem strings de rota ou arrays de chave espalhados pelos hooks.

---

## Separação de responsabilidades

| Camada | Onde | Regra |
|---|---|---|
| Variáveis de ambiente | `config/env.ts` | Única leitura de `process.env` — sem `process.env` espalhado no código |
| Transporte HTTP | `services/http/api-client.ts` | Única instância Axios — consome `config/env`, não lê `process.env` diretamente |
| Rotas da API | `modules/inbox/services/inbox.endpoints.ts` | Endpoints centralizados — services não montam URLs com strings soltas |
| Chamadas de API | `modules/inbox/services/inbox.service.ts` | Funções puras: recebem parâmetros, retornam tipos do domínio |
| Query keys | `modules/inbox/hooks/inbox-query-keys.ts` | Fonte única das keys — hooks e mutations não duplicam arrays |
| Cache e estado servidor | `modules/inbox/hooks/use-*` | React Query — queries e mutations por recurso |
| Componentes de domínio | `modules/inbox/components/` | Orquestram hooks e componentes de UI |
| Componentes visuais | `components/ui/` | Recebem props, não conhecem domínio nem API |
| Contratos de tipo | `modules/inbox/types/inbox.types.ts` | Única fonte de verdade para os tipos do domínio |
| Entry point | `app/page.tsx` | Um import, zero lógica |

Padrão inspirado na arquitetura Rufus, adaptado ao escopo do desafio: sem over-engineering, sem abstrações prematuras.

---

## Server Components vs Client Components

**Server Components** (padrão no App Router):
- `app/layout.tsx` — root layout, sem interação
- `app/page.tsx` — entrada, apenas delega para `InboxPage`

**Client Components** (`"use client"`):
- Tudo em `modules/inbox/` e `components/`

**Por quê o Inbox é majoritariamente client-side?**

React Query e suas subscriptions de polling exigem um contexto de browser. A seleção de conversa, o estado de envio e o composer são interações contínuas que dependem de estado local. Não há ganho real em tentar isolar partes como Server Components nesse contexto — o custo de coordenação superaria o benefício.

---

## Estratégia de dados (React Query)

### Query keys

Centralizadas em `modules/inbox/hooks/inbox-query-keys.ts` (`inboxQueryKeys`),
consumidas pelos hooks e mutations — sem arrays duplicados:

```typescript
inboxQueryKeys.me                              // ["me"]
inboxQueryKeys.conversations                   // ["conversations"]
inboxQueryKeys.conversationMessages(id)        // ["conversation-messages", id]
```

### Polling

| Query | Intervalo | Condição de ativação |
|---|---|---|
| `conversations` | 12 segundos | Sempre que o componente está montado |
| `conversation-messages` | 5 segundos | Só quando `conversationId` não é `null` (`enabled: !!conversationId`) |

Polling agressivo foi deliberadamente evitado. 12s e 5s são suficientes para inbox de suporte e não sobrecarregam a API hospedada.

### Configuração global do QueryClient

```typescript
{
  staleTime: 5_000,         // Dados considerados frescos por 5s — evita refetch desnecessário
  refetchOnWindowFocus: false,  // Sem refetch ao focar a janela
  retry: 1,                 // Uma retentativa em falha — padrão 3 seria agressivo com polling
}
```

---

## Atualização otimista no envio de mensagem

Fluxo em `use-send-message-mutation.ts`:

1. **`onMutate`** — cancela queries em andamento (`messages` e `conversations`) para evitar race condition, salva snapshot do cache atual, insere mensagem local com `id: "optimistic-*"` e opacidade reduzida
2. **`onError`** — restaura o snapshot salvo (rollback completo)
3. **`onSettled`** — invalida `["conversation-messages", id]` e `["conversations"]` para buscar o estado real da API

A mensagem aparece imediatamente para o usuário. Se a API rejeitar, desaparece e o campo preserva o texto para reenvio.

---

## Sugestão de resposta com IA

- Mutation separada (`use-ai-suggestion-mutation.ts`) — não toca o cache de mensagens
- Ao receber a sugestão, preenche o `textarea` via callback (`onSuggestion`)
- O atendente pode editar o texto antes de enviar — a sugestão é apenas ponto de partida
- Erro da IA é exibido em tooltip isolado sobre o botão — o compositor e o chat continuam funcionando normalmente
- O botão exibe spinner próprio durante a requisição sem bloquear a textarea

---

## Polling e feedback operacional

**Problemas endereçados:**

- `isFetching && !isLoading` detecta refetch em background. A lista de conversas exibe uma barra azul de 2px no topo durante sincronização — feedback sem interromper a interação
- `key={conversationId}` no `MessageList` força remontagem ao trocar de conversa, resetando o ref de scroll e evitando que mensagens de uma conversa sejam scrolladas sobre outra
- Scroll usa `"instant"` na primeira renderização (posiciona sem animação) e `"smooth"` apenas em mensagens novas — evita o efeito de "pular" ao carregar uma conversa com histórico
- `cancelQueries` em `onMutate` cancela tanto mensagens quanto conversas, evitando que um refetch em andamento sobreponha o estado otimista

---

## UX e acessibilidade

**Layout:**
- Desktop: sidebar fixa (280-320px) + painel de chat adaptável
- Mobile: lista visível sem conversa selecionada, chat ocupa tela inteira quando há conversa ativa — navegação por botão de voltar

**Estados cobertos em todas as superfícies:**

| Estado | Tratamento |
|---|---|
| Loading inicial | Skeleton animado proporcional ao conteúdo |
| Refetch em background | Barra de sincronização discreta (não bloqueia) |
| Erro de API | ErrorState com mensagem e botão de retry |
| Vazio | EmptyState com mensagem contextual |
| Enviando mensagem | Textarea e botão desabilitados, spinner no botão |
| Erro de envio | Mensagem de erro inline, texto preservado no composer |
| Sugerindo IA | Spinner no botão IA, compositor editável |
| Erro de sugestão IA | Tooltip isolado, chat inalterado |
| Sem conversa selecionada | Tela de placeholder com instrução |

**Acessibilidade implementada:**
- `aria-label` em todos os botões sem texto visível
- `aria-pressed` nos itens de conversa selecionados
- `role="log" aria-live="polite"` no histórico de mensagens
- `role="alert"` em mensagens de erro
- Foco visível via `focus-visible:ring-*` nos elementos interativos

---

## Decisões e trade-offs

**Tailwind puro em vez de UI library (MUI, shadcn, Radix)**
O design system foi construído do zero com ~10 componentes. Mantém controle total sobre a paleta Myde, elimina dependências pesadas e é suficiente para o escopo do desafio. shadcn/Radix seria justificável em produto com mais superfícies.

**Polling em vez de WebSocket/SSE**
A API fornecida é REST, sem endpoint de streaming. Polling a 5–12s é adequado para inbox de suporte e reduz complexidade de infraestrutura. Para produção com volume alto, SSE ou WebSocket seriam a evolução natural.

**Sem autenticação real**
O endpoint `/me` está disponível e é consumido para exibir o nome do atendente. Não há fluxo de login/token porque o backend fornecido não requer autenticação nos demais endpoints.

**Sem backend local novo**
A API já está hospedada e funcional. Criar um backend local seria escopo fora do desafio e geraria complexidade operacional sem valor demonstrável.

**React Query como única camada de estado servidor**
Não foi usado Redux, Zustand nem Context para dados do servidor — React Query já resolve cache, polling, otimismo e invalidação. Estado de UI local (conversa selecionada, texto do composer) ficou em `useState` simples no componente mais próximo.

**Endpoints e query keys centralizados por domínio**
Rotas da API (`inbox.endpoints.ts`) e query keys (`inbox-query-keys.ts`) ficam em arquivos únicos do módulo inbox. Evita strings de rota e arrays de chave duplicados entre service, hooks e mutations, sem introduzir um router global ou abstração maior que o escopo exige.

---

## O que faria com mais tempo

**Qualidade e confiabilidade:**
- Testes unitários dos hooks (`use-send-message-mutation`, `use-conversations-query`) com Vitest + Testing Library
- Testes e2e do fluxo principal (selecionar conversa → enviar → rollback) com Playwright
- Auditoria de acessibilidade com axe-core ou Lighthouse

**Produto:**
- Persistência da conversa selecionada na URL (`/inbox/[conversationId]`) — deep link e reload seguro
- Scroll inteligente: parar de forçar scroll ao fundo se o usuário estiver lendo o histórico
- Virtualização da lista de mensagens com TanStack Virtual para conversas longas
- Paginação/cursor nos endpoints de mensagens e conversas
- WebSocket ou SSE em substituição ao polling para latência real-time
- Suporte a mensagens com mídia (imagem, áudio) assim que a API evoluir

**Observabilidade:**
- Error boundary global com logging estruturado
- Métricas de frontend (Core Web Vitals, tempo de resposta percebido)

---

## Contratos de API

Base URL: variável `NEXT_PUBLIC_API_URL`

```
GET  /me
     → Agent { id, name, role }

GET  /conversations
     → Conversation[] (desc por lastMessageAt)

GET  /conversations/:id/messages
     → Message[] (asc por createdAt)

POST /conversations/:id/messages    { text: string }
     → Message  (HTTP 201)

POST /ai/suggest                    { conversationId: string }
     → AiSuggestion { suggestion, source }
```

Padrão de erro: `{ "error": "mensagem descritiva" }` com status `400`, `401` ou `404`.

---

## Identidade visual

| Token CSS | Valor |
|---|---|
| `--bg` | `#02060D` |
| `--surface` | `#0B111C` |
| `--surface-raised` | `#111827` |
| `--border` | `#1F2A3D` |
| `--accent` | `#1E80FF` |
| `--text` | `#F8FAFC` |
| `--text-muted` | `#7C8CA3` |

Tokens definidos em `app/globals.css` via `@theme inline` do Tailwind v4, consumíveis como `bg-accent`, `text-text-muted`, etc.

---

## Histórico de commits

A implementação seguiu o padrão **Conventional Commits** com commits pequenos e rastreáveis — cada commit entrega uma camada ou funcionalidade isolada, validada com `typecheck + lint + build` antes do próximo. O histórico é auditável via `git log --oneline`.
